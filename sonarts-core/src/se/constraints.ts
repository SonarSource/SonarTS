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
export enum ConstraintKind {
  Falsy,
  Truthy,
}

export interface Constraint {
  kind: ConstraintKind;
}

export interface TruthyConstraint extends Constraint {
  kind: ConstraintKind.Truthy;
}

export interface FalsyConstraint extends Constraint {
  kind: ConstraintKind.Falsy;
}

const truthyConstraint: TruthyConstraint = { kind: ConstraintKind.Truthy };
const falsyConstraint: FalsyConstraint = { kind: ConstraintKind.Falsy };

export function isTruthyConstraint(constraint: Constraint): constraint is TruthyConstraint {
  return constraint.kind === ConstraintKind.Truthy;
}

export function isFalsyConstraint(constraint: Constraint): constraint is FalsyConstraint {
  return constraint.kind === ConstraintKind.Falsy;
}

export function getTruthyConstraint(): TruthyConstraint {
  return truthyConstraint;
}

export function getFalsyConstraint(): FalsyConstraint {
  return falsyConstraint;
}

export function isEqualConstraints(a: Constraint, b: Constraint): boolean {
  return a.kind === b.kind;
}

export function constrain(list: Constraint[], candidate: Constraint): Constraint[] | undefined {
  const newList = [];
  let existingKind = false;
  for (const item of list) {
    const result = constrainWith(item, candidate);
    if (!result) {
      return undefined;
    }
    newList.push(...result);
    if (item.kind === candidate.kind) {
      existingKind = true;
    }
  }
  if (!existingKind) {
    newList.push(candidate);
  }
  return newList;
}

function constrainWith(what: Constraint, withWhat: Constraint): Constraint[] | undefined {
  return what.kind === withWhat.kind ? [what] : undefined;
}

export function isTruthy(constraints: Constraint[]) {
  return constraints.length === 1 && isTruthyConstraint(constraints[0]);
}

export function isFalsy(constraints: Constraint[]) {
  return constraints.length === 1 && isFalsyConstraint(constraints[0]);
}
