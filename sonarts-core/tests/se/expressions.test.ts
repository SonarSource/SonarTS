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
import { runStack } from "../utils/seTestUtils";
import { SymbolicValue } from "../../src/se/symbolicValues";

describe("Expressions", () => {
  it("assignment", check(`let a; _inspectStack(a = 0);`, { type: "literal", value: "0" }, true));

  it("function call", check(`let foo = function() {}; _inspectStack(foo());`, { type: "unknown" }, true));

  it(
    "function call with parameters",
    check(`let foo; let x = 0; let y = 1; _inspectStack(foo(x, y));`, { type: "unknown" }, true),
  );

  it("object declaration", check(`_inspectStack({ bar: 0 });`, { type: "object" }, false));

  it("property access expression", check(`let foo = { bar: 0 }; _inspectStack(foo.bar);`, { type: "unknown" }, false));

  it(
    "defaults to pushing unknown value",
    check(`let x = foo(); _inspectStack(x = x + 1);`, { type: "unknown" }, false),
  );
});

function check(source: string, expectedSV: SymbolicValue, expectedEmpty: boolean) {
  return () => {
    expect.assertions(2);
    runStack(source, (sv, empty) => {
      expect(sv).toEqual(expectedSV);
      expect(empty).toBe(expectedEmpty);
    });
  };
}
