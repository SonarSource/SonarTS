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
import * as path from "path";
import * as ts from "typescript";
import { processRequest } from "../../src/runner/tsrunner";
import { parseString } from "../../src/utils/parser";

it("should process full input", () => {
  const filepath = path.join(__dirname, "./fixtures/runner_project/sample.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/runner_project/tsconfig.json");
  const result = processRequest(
    `{"filepaths": ["${filepath}"], "rules": [{"ruleName": "no-empty"}], "tsconfig": "${tsconfig}"}`,
  );
  expect(result).toEqual([
    {
      filepath,
      issues: [
        {
          failure: "block is empty",
          startPosition: { line: 0, character: 12, position: 12 },
          endPosition: { line: 0, character: 14, position: 14 },
          name: filepath,
          ruleName: "no-empty",
          fix: undefined,
          ruleSeverity: "ERROR",
        },
      ],
      highlights: [{ startLine: 1, startCol: 0, endLine: 1, endCol: 8, textType: "keyword" }],
      cpdTokens: [
        { startLine: 1, startCol: 0, endLine: 1, endCol: 8, image: "function" },
        { startLine: 1, startCol: 9, endLine: 1, endCol: 10, image: "x" },
        { startLine: 1, startCol: 10, endLine: 1, endCol: 11, image: "(" },
        { startLine: 1, startCol: 11, endLine: 1, endCol: 12, image: ")" },
        { startLine: 1, startCol: 12, endLine: 1, endCol: 13, image: "{" },
        { startLine: 1, startCol: 13, endLine: 1, endCol: 14, image: "}" },
      ],
      ncloc: [1],
      commentLines: [],
      nosonarLines: [],
      executableLines: [],
      statements: 0,
      functions: 1,
      classes: 0,
    },
  ]);
});
