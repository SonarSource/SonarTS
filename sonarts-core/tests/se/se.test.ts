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
import { isEqual } from "lodash";
import { run } from "../utils/seTestUtils";

describe("Variable Declaration", () => {
  it("creates unknown symbolic value", () => {
    expect.assertions(1);
    run(`let x = foo(); _inspect(x);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "unknown" });
    });
  });

  it("creates literal symbolic value", () => {
    expect.assertions(1);
    run(`let x = 0; _inspect(x);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "literal", value: "0" });
    });
  });

  it("initializes with undefined", () => {
    expect.assertions(1);
    run(`let x; _inspect(x);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "undefined" });
    });
  });

  it("initializes with already known symbolic value", () => {
    expect.assertions(1);
    run(`let x = foo(); let y = x; _inspect(x, y);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toBe(states[0].sv(symbols.get("y")));
    });
  });
});

describe("Assignment", () => {
  it("assigns already known symbolic value", () => {
    expect.assertions(1);
    run(`let y; let x = foo(); y = x; _inspect(x, y);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toBe(states[0].sv(symbols.get("y")));
    });
  });

  it("assigns literal symbolic value", () => {
    expect.assertions(1);
    run(`let x = foo(); x = 0; _inspect(x);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "literal", value: "0" });
    });
  });

  it("assigns unknown symbolic value", () => {
    expect.assertions(1);
    run(`let x; x = foo(); _inspect(x);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "unknown" });
    });
  });
});

describe("Expressions", () => {
  it("chains assignments", () => {
    expect.assertions(1);
    run(`let a; let b; a = b = 0; _inspect(a);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("a"))).toEqual({ type: "literal", value: "0" });
    });
  });
});

describe("Conditions", () => {
  it("tracks symbolic values across branches", () => {
    expect.assertions(2);
    run(`let x = 0; if (cond) { x = 1; } _inspect(x);`, (node, states, symbols) => {
      expect(states.find(state => isEqual(state.sv(symbols.get("x")), { type: "literal", value: "0" }))).toBeTruthy();
      expect(states.find(state => isEqual(state.sv(symbols.get("x")), { type: "literal", value: "1" }))).toBeTruthy();
    });
  });
});

describe("Loops", () => {
  it("does not cycle on loops", () => {
    expect.assertions(1);
    run(`for (let x = 0; x < 100; x++) { _inspect(x); }`, () => {
      expect(true).toBeTruthy();
    });
  });
});
