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
import { inspectSV, inspectSVFromResult, executeOneFunction } from "../seTestUtils";
import { simpleSymbolicValue, undefinedSymbolicValue, numericLiteralSymbolicValue } from "../../src/se/symbolicValues";

describe("Variable Declaration", () => {
  it("creates unknown symbolic value", () => {
    const values = inspectSV(`let x = foo(); _inspect(x);`);
    expect(values["x"]).toEqual([simpleSymbolicValue()]);
  });

  it("creates literal symbolic value", () => {
    const values = inspectSV(`let x = 0; _inspect(x);`);
    expect(values["x"]).toEqual([numericLiteralSymbolicValue("0")]);
  });

  it("initializes with undefined", () => {
    const values = inspectSV(`let x; _inspect(x);`);
    expect(values["x"]).toEqual([undefinedSymbolicValue()]);
  });

  it("initializes with already known symbolic value", () => {
    const values = inspectSV(`let x = foo(); let y = x; _inspect(x, y);`);
    expect(values["x"][0]).toBe(values["y"][0]);
  });
});

describe("Assignment", () => {
  it("assigns already known symbolic value", () => {
    const values = inspectSV(`let y; let x = foo(); y = x; _inspect(x, y);`);
    expect(values["x"][0]).toBe(values["y"][0]);
  });

  it("assigns literal symbolic value", () => {
    const values = inspectSV(`let x = foo(); x = 0; _inspect(x);`);
    expect(values["x"]).toEqual([numericLiteralSymbolicValue("0")]);
  });

  it("assigns unknown symbolic value", () => {
    const values = inspectSV(`let x; x = foo(); _inspect(x);`);
    expect(values["x"]).toEqual([simpleSymbolicValue()]);
  });

  it("chains assignments", () => {
    const values = inspectSV(`let x; let y; x = y = 0; _inspect(x);`);
    expect(values["x"]).toEqual([numericLiteralSymbolicValue("0")]);
  });

  it("assigns unknown to all destructuring identifiers", () => {
    const values = inspectSV(`let x; ({x} = foo()); _inspect(x);`);
    expect(values["x"]).toEqual([simpleSymbolicValue()]);
  });
});

describe("Increments Decrements", () => {
  it("changes SV after postfix", () => {
    const values = inspectSV(`let x = 0; let y = 0; x++; y--; _inspect(x, y);`);
    expect(values["x"]).toEqual([simpleSymbolicValue()]);
    expect(values["y"]).toEqual([simpleSymbolicValue()]);
  });
});

describe("Conditions", () => {
  it("tracks symbolic values across branches", () => {
    const values = inspectSV(`let x = 0; if (cond) { x = 1; } _inspect(x);`);
    expect(values["x"]).toContainEqual(numericLiteralSymbolicValue("1"));
    expect(values["x"]).toContainEqual(numericLiteralSymbolicValue("0"));
    expect(values["x"]).toHaveLength(2);
  });
});

describe("Loops", () => {
  it("does not cycle on loops", () => {
    const values = inspectSV(`for (let x = 0; x < 100; x++) { _inspect(x); }`);
    expect(values).toBeDefined();
  });
});

describe("Parameters", () => {
  it("initializes program state with parameters symbols to unknown", () => {
    const { result, program } = executeOneFunction(`function foo(x: any, y: any) { _inspect(x, y); }`);
    const values = inspectSVFromResult(result, program);
    expect(values["x"]).toEqual([simpleSymbolicValue()]);
  });
});
