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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { parseString } from "../../src/utils/parser";
import { findChild, descendants } from "../../src/utils/navigation";
import { SyntaxKind } from "typescript";

const src = `
    function sum(a, b) {
        return a + b;
    }`;

describe("#findChild", () => {
  it("should work when node is present", () => {
    const { sourceFile } = parseString(src);
    const functionNode = descendants(sourceFile).find(node => node.kind === SyntaxKind.FunctionDeclaration);
    const node = findChild(functionNode, SyntaxKind.Identifier);
    expect(node.kind).toBe(SyntaxKind.Identifier);
  });

  it("should work when one of wanted node is present", () => {
    const { sourceFile } = parseString(src);
    const functionNode = descendants(sourceFile).find(node => node.kind === SyntaxKind.FunctionDeclaration);
    const node = findChild(functionNode, SyntaxKind.Identifier, SyntaxKind.ConditionalExpression);
    expect(node.kind).toBe(SyntaxKind.Identifier);
  });

  it("should throw when cannot find node", () => {
    const { sourceFile } = parseString(src);
    expect(() => findChild(sourceFile, SyntaxKind.ConditionalExpression)).toThrow(
      "Not found child with kind ConditionalExpression",
    );
  });
});
