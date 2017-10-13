/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
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
import * as lodash from "lodash";
import * as path from "path";
import { executeRule } from "../../src/runner/rules";
import * as tslint from "tslint";
import * as ts from "typescript";

interface Results {
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
  return lodash.sortBy(glob.sync(tsconfigPaths));
}

export function runRules(rules: tslint.Rules.AbstractRule[], tsConfigFiles: string[]): Results {
  let results = {};
  console.log("Analyzing:");
  tsConfigFiles.forEach(tsConfigFile => {
    console.log("  *", getFileNameForSnapshot(tsConfigFile));
    const program = getProgram(tsConfigFile);
    const files = lodash.sortBy(getProgramFiles(program));
    files.forEach(file => {
      rules.forEach(Rule => {
        const rule = initRule(Rule);
        const errorLines = executeRule(rule, file, program).map(
          failure => failure.getStartPosition().getLineAndCharacter().line + 1,
        );
        const ruleName = (Rule as any).metadata.ruleName;
        results = addErrorsToResults(results, ruleName, getFileNameForSnapshot(file.fileName), errorLines);
      });
    });
  });
  console.log("");
  return results;
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

function initRule(Rule: any): tslint.IRule {
  const RULE_OPTIONS: tslint.IOptions = {
    disabledIntervals: [],
    ruleArguments: [],
    ruleName: "",
    ruleSeverity: "error",
  };
  return new Rule(RULE_OPTIONS);
}

function getProgram(tsConfigFile: string): ts.Program {
  return tslint.Linter.createProgram(tsConfigFile);
}

function getProgramFiles(program: ts.Program): ts.SourceFile[] {
  return program.getSourceFiles().filter(file => !file.isDeclarationFile);
}

function addErrorsToResults(results: Results, ruleName: string, fileName: string, errorLines: number[]): Results {
  if (errorLines.length > 0) {
    const nextResults = { ...results };

    if (!(ruleName in nextResults)) {
      nextResults[ruleName] = {};
    }

    if (!(fileName in nextResults[ruleName])) {
      nextResults[ruleName][fileName] = [];
    }

    nextResults[ruleName][fileName] = [...nextResults[ruleName][fileName], ...errorLines];

    return nextResults;
  } else {
    return results;
  }
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
