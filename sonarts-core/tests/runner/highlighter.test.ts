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
import getHighlighting, { HighlightedToken, SonarTypeOfText } from "../../src/runner/highlighter";
import { parseString } from "../../src/utils/parser";

it("should highlight keywords", () => {
  const result = actual(
    `class A {
     get b() {
       return this.a;
     }
     static foo() {
       if (cond);
     }
     a: string;
  }`,
  );
  expect(result).toContainEqual(token(1, 0, 1, 5, "keyword")); // class
  expect(result).toContainEqual(token(2, 5, 2, 8, "keyword")); // get
  expect(result).toContainEqual(token(3, 7, 3, 13, "keyword")); // return
  expect(result).toContainEqual(token(3, 14, 3, 18, "keyword")); // this
  expect(result).toContainEqual(token(5, 5, 5, 11, "keyword")); // static
  expect(result).toContainEqual(token(6, 7, 6, 9, "keyword")); // if
  expect(result).toContainEqual(token(8, 8, 8, 14, "keyword")); // string
});

it("should highlight comments", () => {
  const result = actual(
    `a // comment1
  /*comment2*/
  // comment3
  b // comment4
  /**
   * comment5
   */
  c
  // comment6`,
  );
  expect(result.length).toBe(6);
  expect(result).toContainEqual(token(1, 2, 1, 13, "comment")); // 1
  expect(result).toContainEqual(token(2, 2, 2, 14, "comment")); // 2
  expect(result).toContainEqual(token(3, 2, 3, 13, "comment")); // 3
  expect(result).toContainEqual(token(4, 4, 4, 15, "comment")); // 4
  expect(result).toContainEqual(token(5, 2, 7, 5, "structured_comment")); // 5
  expect(result).toContainEqual(token(9, 2, 9, 13, "comment")); // 6
});

it("should highlight strings", () => {
  expect(actual("'str'")).toContainEqual(token(1, 0, 1, 5, "string"));
  expect(actual('"str"')).toContainEqual(token(1, 0, 1, 5, "string"));

  expect(actual("`str`")).toContainEqual(token(1, 0, 1, 5, "string"));
  expect(actual("`line1\nline2`")).toContainEqual(token(1, 0, 2, 6, "string"));

  expect(actual("`start ${x} middle ${y} end`")).toContainEqual(token(1, 0, 1, 9, "string"));
  expect(actual("`start ${x} middle ${y} end`")).toContainEqual(token(1, 10, 1, 21, "string"));
  expect(actual("`start ${x} middle ${y} end`")).toContainEqual(token(1, 22, 1, 28, "string"));
});

it("should highlight numbers", () => {
  expect(actual("0")).toContainEqual(token(1, 0, 1, 1, "constant"));
  expect(actual("0.0")).toContainEqual(token(1, 0, 1, 3, "constant"));
  expect(actual("-0.0")).toContainEqual(token(1, 1, 1, 4, "constant"));
  expect(actual("10e-2")).toContainEqual(token(1, 0, 1, 5, "constant"));
});

function token(
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number,
  textType: SonarTypeOfText,
): HighlightedToken {
  return {
    startLine,
    startCol,
    endLine,
    endCol,
    textType,
  };
}

function actual(content: string): HighlightedToken[] {
  const sourceFile = parseString(content);
  return getHighlighting(sourceFile).highlights;
}
