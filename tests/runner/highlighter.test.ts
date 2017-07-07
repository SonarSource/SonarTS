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
import { SyntaxHighlighter } from "../../src/runner/highlighter";
import { parseString } from "../../src/utils/parser";

it("should highlight 'this'", () => {
  const input = { file_content: "class A {\n a: string;\n getA() { return this.a; }\n}" };
  const sourceFile = parseString(input.file_content);
  const output: any = {};
  new SyntaxHighlighter().execute(sourceFile, input, output);
  expect(output.highlights.length).toBe(7);
  expect(output.highlights.find(highlight => highlight.textType === "k")).toEqual({
    startLine: 3,
    startCol: 17,
    endLine: 3,
    endCol: 21,
    textType: "k",
  });
});
