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
import {
  SymbolicValue,
  isEqualSymbolicValues,
  isUndefinedSymbolcValue,
  isNumericLiteralSymbolicValue,
  unknownSymbolicValue,
} from "./symbolicValues";
import { inspect } from "util";
import { Constraint, getTruthyConstraint, getFalsyConstraint, isEqualConstraints, constrain } from "./constraints";
import { Map } from "immutable";

type SymbolicValues = Map<ts.Symbol, SymbolicValue>;
type ExpressionStack = SymbolicValue[];
type Constraints = Map<SymbolicValue, Constraint[]>;

export class ProgramState {
  private readonly symbolicValues: SymbolicValues;
  private readonly expressionStack: ExpressionStack;
  private readonly constraints: Constraints;

  public static empty() {
    return new ProgramState(Map<ts.Symbol, SymbolicValue>(), [], Map<SymbolicValue, Constraint[]>());
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
    return new ProgramState(this.symbolicValues.set(symbol, sv), this.expressionStack, this.constraints);
  }

  pushSV(sv: SymbolicValue): ProgramState {
    const newExpressionStack = [...this.expressionStack, sv];
    return new ProgramState(this.symbolicValues, newExpressionStack, this.constraints);
  }

  popSV(): [SymbolicValue | undefined, ProgramState] {
    const newExpressionStack = [...this.expressionStack];
    return [newExpressionStack.pop(), new ProgramState(this.symbolicValues, newExpressionStack, this.constraints)];
  }

  getStackSize() {
    return this.expressionStack.length;
  }

  constrain(constraint: Constraint) {
    if (this.expressionStack.length > 0) {
      const sv = this.expressionStack[this.expressionStack.length - 1];
      const svConstraints = constrain(this.getConstraints(sv), constraint);
      if (svConstraints) {
        return new ProgramState(this.symbolicValues, this.expressionStack, this.constraints.set(sv, svConstraints));
      } else {
        // impossible program state
        return undefined;
      }
    } else {
      throw new Error("Cannot apply a constraint, because the expression stack is empty");
    }
  }

  constrainToTruthy() {
    return this.constrain(getTruthyConstraint());
  }

  constrainToFalsy() {
    return this.constrain(getFalsyConstraint());
  }

  getConstraints(sv: SymbolicValue) {
    if (isUndefinedSymbolcValue(sv) || (isNumericLiteralSymbolicValue(sv) && sv.value === "0")) {
      return [getFalsyConstraint()];
    }
    if (isNumericLiteralSymbolicValue(sv) && sv.value !== "0") {
      return [getTruthyConstraint()];
    }
    return this.constraints.get(sv) || [];
  }

  hasEmptyStack(): boolean {
    return this.expressionStack.length == 0;
  }

  toString() {
    let prettyEntries = Map<string, SymbolicValue>();
    this.symbolicValues.forEach((value, key) => {
      if (key && value) {
        prettyEntries = prettyEntries.set(key.name, value);
      }
    });
    return inspect({ prettyEntries, expressionStack: this.expressionStack, constraints: this.constraints });
  }

  isEqualTo(another: ProgramState) {
    return (
      this.areTopStackConstraintsEqual(another) &&
      this.areSymbolsEqual(another) &&
      this.areSymbolicValuesEqual(another) &&
      this.areSymbolConstraintsEqual(another)
    );
  }

  private areSymbolsEqual(another: ProgramState) {
    if (this.symbolicValues.size != another.symbolicValues.size) {
      return false;
    }
    const res = this.symbolicValues.keySeq().equals(another.symbolicValues.keySeq());
    return res;
  }

  private areSymbolicValuesEqual(another: ProgramState) {
    return this.symbolicValues.entrySeq().reduce((result, entry) => {
      const [symbol, value] = entry!;
      const anotherValue = another.symbolicValues.get(symbol);
      return result! && anotherValue !== undefined && isEqualSymbolicValues(value, anotherValue);
    }, true);
  }

  private areSymbolConstraintsEqual(another: ProgramState) {
    const symbols = this.symbolicValues.keySeq();
    return !symbols.find(symbol => {
      const value = this.sv(symbol!);
      const anotherValue = another.sv(symbol!);

      if (value && anotherValue) {
        const constraints = this.getConstraints(value);
        const anotherConstraints = another.getConstraints(anotherValue);

        if (!areArraysEqual(constraints, anotherConstraints, isEqualConstraints)) {
          return true;
        }
      }
      return false;
    });
  }

  private areTopStackConstraintsEqual(another: ProgramState) {
    const top = this.expressionStack.length > 0 && this.expressionStack[this.expressionStack.length - 1];
    const anotherTop =
      another.expressionStack.length > 0 && another.expressionStack[another.expressionStack.length - 1];
    if (!top && !anotherTop) {
      return true;
    }
    if (!top || !anotherTop) {
      return false;
    }
    const constraints = this.getConstraints(top);
    const anotherConstraints = another.getConstraints(anotherTop);
    const res = areArraysEqual(constraints, anotherConstraints, isEqualConstraints);
    return res;
  }
}

export function createInitialState(declaration: ts.FunctionLikeDeclaration, program: ts.Program) {
  let state = ProgramState.empty();
  declaration.parameters.forEach(parameter => {
    const symbol = program.getTypeChecker().getSymbolAtLocation(parameter.name);
    if (symbol) {
      state = state.setSV(symbol, unknownSymbolicValue());
    }
  });
  return state;
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
