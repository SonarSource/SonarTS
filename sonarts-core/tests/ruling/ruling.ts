/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { exec } from "child_process";
import { cpus } from "os";
import { promisify } from "util";
import * as lodash from "lodash";
import * as tslint from "tslint";

const execPromise = promisify(exec);
const cpuCount = cpus().length;

const tsNode = path.join(__dirname, "../../node_modules/.bin/ts-node");
const worker = path.join(__dirname, "worker.ts");

export interface Results {
  [rule: string]: {
    [file: string]: number[];
  };
}

export function getRules(rule?: string): tslint.Rules.AbstractRule[] {
  const dir = path.join(__dirname, "../../src/rules");
  if (rule) {
    return [require(path.join(dir, rule) as any).Rule];
  } else {
    return lodash.sortBy(fs.readdirSync(dir)).map(file => require(path.join(dir, file) as any).Rule);
  }
}

export function getTSConfigFiles(): string[] {
  const tsconfigPaths = path.join(__dirname, "../../typescript-test-sources/src") + "/**/tsconfig.json";
  // vscode and TypeScript are the biggest projects, start their analysis first to decrease overall duration
  return lodash.sortBy(
    glob.sync(tsconfigPaths),
    path => (path.includes("vscode/src/tsconfig.json") ? 0 : 1),
    path => (path.includes("TypeScript/src") ? 0 : 1),
    path => path,
  );
}

export async function runRules(tsConfigFiles: string[], rule?: string) {
  let results = {};
  let next = 0; // index of the next tsconfig
  const initial = []; // initially started processes (not all!)

  console.log(`Running on ${cpuCount} CPUs...`);
  console.log("");

  console.log("Analyzing:");

  // start initial processes, their number is equal to the number of CPUs
  for (let index = 0; index < cpuCount; index++) {
    initial.push(runNext());
  }

  // wait until all processes finish
  await Promise.all(initial);

  console.log("");
  return results;

  // runs process for the given `tsConfigFile`
  // after the process finishes, the function chains the promise with the next tsconfig
  function runCommand(tsConfigFile: string): Promise<void> {
    console.log("  *", getFileNameForSnapshot(tsConfigFile));
    let command = `${tsNode} ${worker} ${tsConfigFile}`;
    if (rule) {
      command += ` ${rule}`;
    }
    return execPromise(command)
      .then(
        ({ stdout }) => {
          const response = JSON.parse(stdout);
          results = addToResults(results, response);
        },
        ({ stderr }) => {
          console.error(stderr);
          process.exit(1);
        },
      )
      .then(runNext);
  }

  function runNext(): Promise<void> {
    return next < tsConfigFiles.length ? runCommand(tsConfigFiles[next++]) : Promise.resolve();
  }
}

export function writeResults(results: Results) {
  Object.keys(results).forEach(rule => {
    const content: string[] = [];

    Object.keys(results[rule]).forEach(file => {
      const lines = results[rule][file];
      content.push(`${file}: ${lines.join()}`);
    });

    writeSnapshot(rule, content.join("\n") + "\n");
  });
}

export function checkResults(actual: Results) {
  const actualRules = Object.keys(actual);
  const expected: Results = readSnapshots(actualRules);
  let passed = true;

  actualRules.forEach(rule => {
    const expectedFiles = expected[rule];
    const actualFiles = actual[rule] || {};
    const allFiles = lodash.union(Object.keys(actualFiles), Object.keys(expectedFiles));

    allFiles.forEach(file => {
      const expectedLines = expectedFiles[file] || [];
      const actualLines = actualFiles[file] || [];

      const missingLines = lodash.difference(expectedLines, actualLines);
      if (missingLines.length > 0) {
        passed = false;
        console.log("Missing issues:");
        console.log("  * Rule:", rule);
        console.log("  * File:", file);
        console.log("  * Lines:", missingLines.join(", "));
        console.log();
      }

      const extraLines = lodash.difference(actualLines, expectedLines);
      if (extraLines.length > 0) {
        passed = false;
        console.log("Extra issues:");
        console.log("  * Rule:", rule);
        console.log("  * File:", file);
        console.log("  * Lines:", extraLines.join(", "));
        console.log();
      }
    });
  });

  return passed;
}

function addToResults(results: Results, newResults: Results) {
  const nextResults = { ...results };
  Object.keys(newResults).forEach(rule => {
    nextResults[rule] = { ...nextResults[rule], ...newResults[rule] };
  });
  return nextResults;
}

function getFileNameForSnapshot(path: string): string {
  const marker = "/typescript-test-sources/";
  const pos = path.indexOf(marker);
  return path.substr(pos + marker.length);
}

function writeSnapshot(rule: string, content: string): void {
  const fileName = path.join(__dirname, "snapshots", rule);
  fs.writeFileSync(fileName, content);
}

function readSnapshots(rules: string[]): Results {
  const snapshotsDir = path.join(__dirname, "snapshots");
  const results: Results = {};

  rules.forEach(rule => {
    results[rule] = {};
    const content = readSnapshotFile(snapshotsDir, rule);
    content.forEach(line => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const file = line.substring(0, colonIndex);
        const lines = line
          .substr(colonIndex + 1)
          .split(",")
          .map(s => parseInt(s, 10));
        results[rule][file] = lines;
      }
    });
  });

  return results;
}

function readSnapshotFile(snapshotsDir: string, ruleName: string) {
  const rulePath = path.join(snapshotsDir, ruleName);
  if (fs.existsSync(rulePath)) {
    return fs.readFileSync(rulePath, "utf-8").split("\n");
  } else {
    return [];
  }
}
