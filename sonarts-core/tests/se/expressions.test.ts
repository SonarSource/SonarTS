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
import { inspectStack } from "../seTestUtils";
import {
  SymbolicValue,
  simpleSymbolicValue,
  objectLiteralSymbolicValue,
  numericLiteralSymbolicValue,
} from "../../src/se/symbolicValues";

it("assignment", () => {
  check(`let a; _inspect(a = 0);`, numericLiteralSymbolicValue("0"), true);
});

it("function call", () => {
  check(`let foo = function() {}; _inspect(foo());`, simpleSymbolicValue(), true);
});

it("function call with parameters", () => {
  check(`let foo; let x = 0; let y = 1; _inspect(foo(x, y));`, simpleSymbolicValue(), true);
});

it("object declaration", () => {
  check(`_inspect({ bar: 0 });`, objectLiteralSymbolicValue(), false);
});

it("property access expression", () => {
  check(`let foo = { bar: 0 }; _inspect(foo.bar);`, simpleSymbolicValue(), false);
});

it("defaults to pushing unknown value", () => {
  check(`let x = foo(); _inspect(x = x + 1);`, simpleSymbolicValue(), false);
});

it("postfix increment", () => {
  check(`let x = 0; _inspect(x++)`, simpleSymbolicValue(), true);
});

it("does not push value to the stack", () => {
  const { empty } = inspectStack(`let x = foo(); _inspect(_);`);
  expect(empty).toBe(true);
});

function check<T extends SymbolicValue>(source: string, expectedSV: T, expectedEmpty: boolean) {
  const { top, empty } = inspectStack(source);
  expect(top).toEqual(expectedSV);
  expect(empty).toBe(expectedEmpty);
}
