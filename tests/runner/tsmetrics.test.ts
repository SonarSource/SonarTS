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
jest.mock("fs", () => ({
  readFileSync: () => "function x(){}",
}));

import * as path from "path";
import * as ts from "typescript";
import { processRequest } from "../../src/runner/tsmetrics";
import { parseString } from "../../src/utils/parser";

it("should process input", () => {
  const filepath = path.join(__dirname, "file.ts");
  const result = processRequest(`{"filepaths": ["${filepath}"]}`);
  expect(result).toEqual([
    {
      filepath,
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
