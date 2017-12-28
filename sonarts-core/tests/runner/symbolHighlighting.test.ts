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
import getSymbolHighlighting, { SymbolHighlighting, TextRange } from "../../src/runner/symbolHighlighting";
import { parseString } from "../../src/utils/parser";

it("should return symbols and their references", () => {
  const result = actual(`
    const a = 0;
    const b = 1;
    if (a + b < 3) {}
    function foo(x: any) { return a - x; }
    b;
    class Bar {
      qwe: number = 3;
      method() { this.qwe = 5; }
    }
  `);
  expect(result).toHaveLength(6);
  expect(result).toContainEqual(usage(range(2, 10, 2, 11), [range(4, 8, 4, 9), range(5, 34, 5, 35)])); // a
  expect(result).toContainEqual(usage(range(3, 10, 3, 11), [range(4, 12, 4, 13), range(6, 4, 6, 5)])); // b
  expect(result).toContainEqual(usage(range(5, 13, 5, 16), [])); // foo
  expect(result).toContainEqual(usage(range(5, 17, 5, 18), [range(5, 38, 5, 39)])); // x
  expect(result).toContainEqual(usage(range(7, 10, 7, 13), [])); // Bar
  expect(result).toContainEqual(usage(range(8, 6, 8, 9), [range(9, 22, 9, 25)])); // qwe
});

function usage(textRange: TextRange, references: TextRange[]): SymbolHighlighting {
  return { ...textRange, references };
}

function range(startLine: number, startCol: number, endLine: number, endCol: number): TextRange {
  return { startLine, startCol, endLine, endCol };
}

function actual(source: string) {
  const { sourceFile, program } = parseString(source);
  return getSymbolHighlighting(sourceFile, program).symbols;
}
