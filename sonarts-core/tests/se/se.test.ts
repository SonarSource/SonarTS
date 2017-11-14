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

  it("does not push value to the stack", () => {
    expect.assertions(1);
    run(`let x = foo(); _inspect();`, (node, states, symbols) => {
      // compare with 1, because `_inspect` always pushes one expression to the stack
      expect(states[0].getStackSize()).toBe(1);
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

  it("chains assignments", () => {
    expect.assertions(1);
    run(`let a; let b; a = b = 0; _inspect(a);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("a"))).toEqual({ type: "literal", value: "0" });
    });
  });
});

describe("Increments Decrements", () => {
  it("changes SV after postfix", () => {
    expect.assertions(2);
    run(`let x = 0; let y = 0; x++; y--; _inspect(x, y);`, (node, states, symbols) => {
      expect(states[0].sv(symbols.get("x"))).toEqual({ type: "unknown" });
      expect(states[0].sv(symbols.get("y"))).toEqual({ type: "unknown" });
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

describe.skip("Parameters", () => {
  it("initializes program state with parameters symbols to unknown", () => {
    expect.assertions(1);
    run(
      `function foo(x: any, y: any) {
      _inspect(x, y);
    }`,
      (node, states, symbols) => {
        expect(states[0].sv(symbols.get("x"))).toEqual({ type: "unknown" });
      },
    );
  });
});

describe("Too Many Branches", () => {
  it("cuts execution", () => {
    expect.assertions(0);
    run(
      `
    let x = foo();
    if (x) x = 1; if (x) x = 2; if (x) x = 3; if (x) x = 4; if (x) x = 5; if (x) x = 6; if (x) x = 7; if (x) x = 8;
    if (x) x = 9; if (x) x = 10; if (x) x = 11; if (x) x = 12; if (x) x = 13; if (x) x = 14; if (x) x = 15; if (x) x = 16;
    if (x) x = 17; if (x) x = 18; if (x) x = 19; if (x) x = 20; if (x) x = 21; if (x) x = 22; if (x) x = 23; if (x) x = 24;
    if (x) x = 25;
    _inspect(x);
    `,
      (node, states, symbols) => {
        console.log(states.length);
        expect(true).toBeFalsy(); // This should never be called
      },
    );
  });
});
