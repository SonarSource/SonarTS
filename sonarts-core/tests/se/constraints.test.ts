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
  it("constrains condition to TRUTHY for THEN branch", () => {
    checkConstraints(`let x; if (x) { _inspect(x) }`, getTruthyConstraint());
  });

  it("constrains condition to FALSY for ELSE branch", () => {
    checkConstraints(`let x; if (x) {} else { _inspect(x) } `, getFalsyConstraint());
  });

  it("merges constraints after the block", () => {
    checkConstraints(`let x; if (x) {} else {} _inspect(x)`, [getTruthyConstraint(), getFalsyConstraint()]);
  });

  it("constrains nested IFs", () => {
    checkConstraints(
      `let x; 
       if (x) { 
         if (x) { _inspect(x) } 
       }`,
      getTruthyConstraint(),
    );
  });
});

describe("Conditional expression", () => {
  it("constrains condition to TRUTHY", () => {
    checkConstraints(`let x; x ? _inspect(x) : _`, getTruthyConstraint());
  });

  it("constrains condition to FALSE", () => {
    checkConstraints(`let x; x ? _ : _inspect(x)`, getFalsyConstraint());
  });

  it("merges constraints after the block", () => {
    checkConstraints(`let x; x ? _ : _; _inspect(x)`, [getTruthyConstraint(), getFalsyConstraint()]);
  });
});

describe("While", () => {
  it("constrains condition to TRUTHY", () => {
    checkConstraints(`let x; while(x) { _inspect(x) }`, getTruthyConstraint());
  });

  it("has only FALSY constraint after the block", () => {
    checkConstraints(`let x; while(x) {} _inspect(x)`, [getFalsyConstraint()]);
  });
});

function checkConstraints<T extends Constraint>(source: string, expectedConstraints: T | T[]) {
  expect.assertions(1);
  runConstraints(source, constraints => {
    const expected = Array.isArray(expectedConstraints) ? expectedConstraints : [expectedConstraints];
    expect(constraints).toEqual(expected);
  });
}
