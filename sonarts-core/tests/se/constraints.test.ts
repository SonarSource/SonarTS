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
import { inspectConstraints } from "../seTestUtils";
import { Constraint, truthyConstraint, falsyConstraint } from "../../src/se/constraints";

describe("If", () => {
  it("constrains condition to TRUTHY for THEN branch", () => {
    checkConstraints(`let x = foo(); if (x) { _inspect(x) }`, truthyConstraint());
  });

  it("constrains condition to FALSY for ELSE branch", () => {
    checkConstraints(`let x = foo(); if (x) {} else { _inspect(x) } `, falsyConstraint());
  });

  it("merges constraints after the block", () => {
    checkConstraints(`let x = foo(); if (x) {} else {} _inspect(x)`, [truthyConstraint(), falsyConstraint()]);
  });

  it("constrains nested IFs", () => {
    checkConstraints(
      `let x = foo(); 
       if (x) { 
         if (x) { _inspect(x) } 
       }`,
      truthyConstraint(),
    );
  });
});

describe("Conditional expression", () => {
  it("constrains condition to TRUTHY", () => {
    checkConstraints(`let x = foo(); x ? _inspect(x) : _`, truthyConstraint());
  });

  it("constrains condition to FALSE", () => {
    checkConstraints(`let x = foo(); x ? _ : _inspect(x)`, falsyConstraint());
  });

  it("merges constraints after the block", () => {
    checkConstraints(`let x = foo(); x ? _ : _; _inspect(x)`, [truthyConstraint(), falsyConstraint()]);
  });
});

describe("While", () => {
  it("constrains condition to TRUTHY", () => {
    checkConstraints(`let x = foo(); while(x) { _inspect(x) }`, [truthyConstraint(), truthyConstraint()]);
  });

  it("has only FALSY constraint after the block", () => {
    checkConstraints(`let x = foo(); while(x) {} _inspect(x)`, falsyConstraint());
  });
});

function checkConstraints<T extends Constraint>(source: string, expectedConstraints: T | T[]) {
  const constraints = inspectConstraints(source);
  const expected = Array.isArray(expectedConstraints) ? expectedConstraints : [expectedConstraints];
  expect(constraints).toEqual(expected);
}
