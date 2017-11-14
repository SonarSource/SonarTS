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
import * as ts from "typescript";
import { SymbolicValue, isEqualSymbolicValues } from "./symbolicValues";
import { inspect } from "util";
import { Constraint, getTruthyConstraint, getFalsyConstraint } from "./constraints";

type SymbolicValues = Map<ts.Symbol, SymbolicValue>;
type ExpressionStack = SymbolicValue[];
type Constraints = Map<SymbolicValue, Constraint[]>;

export class ProgramState {
  private readonly symbolicValues: SymbolicValues;
  private readonly expressionStack: ExpressionStack;
  private readonly constraints: Constraints;

  public static empty() {
    return new ProgramState(new Map(), [], new Map());
  }

  private constructor(symbolicValues: SymbolicValues, expressionStack: ExpressionStack, constraints: Constraints) {
    this.symbolicValues = symbolicValues;
    this.expressionStack = expressionStack;
    this.constraints = constraints;
  }

  sv(symbol: ts.Symbol): SymbolicValue | undefined {
    return this.symbolicValues.get(symbol);
  }

  setSV(symbol: ts.Symbol, sv: SymbolicValue) {
    const newSymbolicValues = new Map(this.symbolicValues);
    newSymbolicValues.set(symbol, sv);
    return new ProgramState(newSymbolicValues, this.expressionStack, this.constraints);
  }

  pushSV(sv: SymbolicValue): ProgramState {
    const newExpressionStack = [...this.expressionStack, sv];
    return new ProgramState(this.symbolicValues, newExpressionStack, this.constraints);
  }

  popSV(): [SymbolicValue | undefined, ProgramState] {
    const newExpressionStack = [...this.expressionStack];
    return [newExpressionStack.pop(), new ProgramState(this.symbolicValues, newExpressionStack, this.constraints)];
  }

  addConstraint(constraint: Constraint) {
    if (this.expressionStack.length > 0) {
      const sv = this.expressionStack[this.expressionStack.length - 1];
      const newConstraints = new Map(this.constraints);
      const svConstraints = newConstraints.get(sv) || [];
      newConstraints.set(sv, [...svConstraints, constraint]);
      return new ProgramState(this.symbolicValues, this.expressionStack, newConstraints);
    } else {
      throw new Error("Cannot apply a constraint, because the expression stack is empty");
    }
  }

  addTruthyConstraint() {
    return this.addConstraint(getTruthyConstraint());
  }

  addFalsyConstraint() {
    return this.addConstraint(getFalsyConstraint());
  }

  getConstraints(sv: SymbolicValue) {
    return this.constraints.get(sv);
  }

  hasEmptyStack(): boolean {
    return this.expressionStack.length == 0;
  }

  toString() {
    const prettyEntries = new Map<string, SymbolicValue>();
    this.symbolicValues.forEach((value, key) => {
      prettyEntries.set(key.name, value);
    });
    return inspect({ prettyEntries, expressionStack: this.expressionStack, constraints: this.constraints });
  }

  isEqualTo(another: ProgramState) {
    return this.areSymbolsEqual(another) && this.areSymbolicValuesEqual(another);
  }

  private areSymbolsEqual(another: ProgramState) {
    const symbols = Array.from(this.symbolicValues.keys());
    const anotherSymbols = Array.from(another.symbolicValues.keys());
    return areArraysEqual(symbols, anotherSymbols);
  }

  private areSymbolicValuesEqual(another: ProgramState) {
    return Array.from(this.symbolicValues.entries()).reduce((result, [symbol, value]) => {
      const anotherValue = another.symbolicValues.get(symbol);
      return result && anotherValue !== undefined && isEqualSymbolicValues(value, anotherValue);
    }, true);
  }
}

function areArraysEqual<T>(a: T[], b: T[], comparator = (a: T, b: T) => a === b) {
  return (
    a.length === b.length &&
    a.reduce((result, valueA, index) => {
      const valueB = b[index];
      return result && comparator(valueA, valueB);
    }, true)
  );
}
