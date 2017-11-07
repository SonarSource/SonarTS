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

import * as ts from "typescript";
import * as tslint from "tslint";
import * as rules from "./rules";
import getMetrics from "./metrics";
import getHighlighting from "./highlighter";
import getCpdTokens from "./cpd";

const sensors: Array<(sourceFile: ts.SourceFile) => any> = [getHighlighting, getMetrics, getCpdTokens];

export function processRequest(inputString: string): object[] {
  const input = JSON.parse(inputString);
  let program = tslint.Linter.createProgram(input.tsconfig);

  let output = input.filepaths.map((filepath: string) => {
    const sourceFile = program.getSourceFile(filepath);
    const output: object = { filepath };
    if (sourceFile) {
      sensors.forEach(sensor => Object.assign(output, sensor(sourceFile)));
      Object.assign(output, rules.getIssues(input.rules, program, sourceFile));
    } else {
      console.error(`Failed to find a source file matching path ${filepath} in program created with ${input.tsconfig}`);
    }
    return output;
  });
  return output;
}
