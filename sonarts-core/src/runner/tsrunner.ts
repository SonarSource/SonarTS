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
import * as ts from "typescript";
import { parseString } from "../utils/parser";
import getCpdTokens from "./cpd";
import getHighlighting from "./highlighter";
import getMetrics from "./metrics";
import * as rules from "./rules";
import * as tslint from "tslint";

const chunks: string[] = [];

process.stdin.resume();
process.stdin.setEncoding("utf8");

const sensors: Array<(sourceFile: ts.SourceFile) => any> = [getHighlighting, getMetrics, getCpdTokens];

process.stdin.on("data", (chunk: string) => {
  chunks.push(chunk);
});

process.stdin.on("end", () => {
  const inputString = chunks.join("");

  process.stdout.setEncoding("utf8");
  process.stdout.write("[");

  const results = processRequest(inputString);
  results.forEach((output, index) => {
    process.stdout.write(JSON.stringify(output, null, " "));
    if (index < results.length - 1) {
      process.stdout.write(",");
    }
  });

  process.stdout.write("]\n");
});

export function processRequest(inputString: string): object[] {
  const input = JSON.parse(inputString);
  let program = tslint.Linter.createProgram(input.tsconfig);

  let output = input.filepaths.map((filepath: string) => {
    const scriptKind = filepath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const fileContent = fs.readFileSync(filepath, "utf8");
    const sourceFile = parseString(fileContent, scriptKind);
    const output: object = { filepath };
    sensors.forEach(sensor => Object.assign(output, sensor(sourceFile)));
    Object.assign(output, rules.getIssues(input.rules, program, filepath));
    return output;
  });
  return output;
}
