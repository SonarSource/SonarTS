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
import { runConstraints } from "../utils/seTestUtils";
import { Constraint, getTruthyConstraint, getFalsyConstraint } from "../../src/se/constraints";

describe("If", () => {
  it("constraints condition to TRUTHY for THEN branch", () => {
    checkConstaint(`let x; if (x) { _inspect(x) }`, getTruthyConstraint());
  });

  it("constraints condition to FALSY for ELSE branch", () => {
    checkConstaint(`let x; if (x) {} else { _inspect(x) } `, getFalsyConstraint());
  });
});

describe("Conditional expression", () => {
  it("constraints condition to TRUTHY", () => {
    checkConstaint(`let x; x ? _inspect(x) : _`, getTruthyConstraint());
  });

  it("constraints condition to FALSE", () => {
    checkConstaint(`let x; x ? _ : _inspect(x)`, getFalsyConstraint());
  });
});

describe("While", () => {
  it("constraints condition to TRUTHY", () => {
    checkConstaint(`let x; while(x) { _inspect(x) }`, getTruthyConstraint());
  });
});

function checkConstaint<T extends Constraint>(source: string, expectedConstraint: T) {
  expect.assertions(1);
  runConstraints(source, constraints => {
    expect(constraints).toEqual([expectedConstraint]);
  });
}
