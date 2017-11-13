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
import { run } from "../utils/seTestUtils";

describe("Expressions", () => {
  it("assignment", () => {
    expect.assertions(1);
    run(`let a; _inspectStack(a = 0);`, (node, states, symbols) => {
      expect(states[0].popSV()[0]).toEqual({ type: "literal", value: "0" });
    });
  });

  it("function call", () => {
    expect.assertions(2);
    run(`let foo = function() {}; _inspectStack(foo());`, (node, states, symbols) => {
      let [topOfStack, nextState] = states[0].popSV();
      expect(topOfStack).toEqual({ type: "unknown" });
      expect(nextState.popSV()[0]).toBeUndefined();
    });
  });

  it("function call with parameters", () => {
    expect.assertions(2);
    run(`let foo; let x = 0; let y = 1; _inspectStack(foo(x, y));`, (node, states, symbols) => {
      let [topOfStack, nextState] = states[0].popSV();
      expect(topOfStack).toEqual({ type: "unknown" });
      expect(nextState.popSV()[0]).toBeUndefined();
    });
  });
});