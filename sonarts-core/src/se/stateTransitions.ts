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
  numericLiteralSymbolicValue,
  simpleSymbolicValue,
  undefinedSymbolicValue,
  objectLiteralSymbolicValue,
} from "./symbolicValues";
import { ProgramState } from "./programStates";
import { SymbolTable } from "../symbols/table";
import { collectLeftHandIdentifiers, isAssignmentKind } from "../utils/navigation";

export function applyExecutors(
  programPoint: ts.Node,
  state: ProgramState,
  symbols: SymbolTable,
  shouldTrackSymbol: (symbol: ts.Symbol) => boolean = () => true,
): ProgramState {
  const { parent } = programPoint;

  // TODO is there a better way to handle this?
  // special case: `let x;`
  if (parent && ts.isVariableDeclaration(parent) && parent.name === programPoint) {
    return variableDeclaration(parent);
  }

  if (ts.isNumericLiteral(programPoint)) {
    return numeralLiteral(programPoint);
  }

  if (ts.isIdentifier(programPoint)) {
    return identifier(programPoint);
  }

  if (ts.isBinaryExpression(programPoint)) {
    return binaryExpression(programPoint);
  }

  if (ts.isVariableDeclaration(programPoint)) {
    return variableDeclaration(programPoint);
  }

  if (ts.isCallExpression(programPoint)) {
    return callExpression(programPoint);
  }

  if (ts.isObjectLiteralExpression(programPoint)) {
    return objectLiteralExpression();
  }

  if (ts.isPropertyAccessExpression(programPoint)) {
    return propertyAccessExpression();
  }

  if (ts.isPostfixUnaryExpression(programPoint)) {
    return postfixUnaryExpression(programPoint);
  }

  return state.pushSV(simpleSymbolicValue());

  function identifier(identifier: ts.Identifier) {
    const symbol = symbolAt(identifier);
    let sv = (symbol && state.sv(symbol)) || simpleSymbolicValue();
    return state.pushSV(sv);
  }

  function numeralLiteral(literal: ts.NumericLiteral) {
    return state.pushSV(numericLiteralSymbolicValue(literal.text));
  }

  function binaryExpression(expression: ts.BinaryExpression) {
    if (isAssignmentKind(expression.operatorToken.kind)) {
      return collectLeftHandIdentifiers(expression.left).identifiers.reduce((state, identifier) => {
        if (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          let [value, nextState] = state.popSV();
          const variable = symbolAt(identifier);
          if (!variable) {
            return nextState;
          }

          if (!value) {
            throw new Error("Assignment without value");
          }
          return nextState.pushSV(value).setSV(variable, value);
        } else {
          const variable = symbolAt(identifier);
          const value = simpleSymbolicValue();
          return variable ? state.pushSV(value).setSV(variable, value) : state;
        }
      }, state);
    } else if (
      expression.operatorToken.kind == ts.SyntaxKind.EqualsEqualsToken ||
      expression.operatorToken.kind == ts.SyntaxKind.EqualsEqualsEqualsToken
    ) {
      return equalityExpression(state, function(state) { return state.constrainToTruthy() })
    } else if (
      expression.operatorToken.kind == ts.SyntaxKind.ExclamationEqualsToken ||
      expression.operatorToken.kind == ts.SyntaxKind.ExclamationEqualsEqualsToken
    ) {
      return equalityExpression(state, function(state) { return state.constrainToFalsy() })
    }
    return state.pushSV(simpleSymbolicValue());
  }

  function equalityExpression(programState: ProgramState, constrainer: (state: ProgramState) => ProgramState | undefined): ProgramState{
    const [sv1, oncePoppedState] = programState.popSV();
    const [sv2, twicePoppedState] = oncePoppedState.popSV();

    const stateWithExpressionSV = twicePoppedState.pushSV(simpleSymbolicValue());
    const constrainedState = constrainer(stateWithExpressionSV);
    if (!constrainedState) {
      throw new Error("New SV could not be constrained");
    }
    return sv1 && sv2 && sv1 == sv2 ? constrainedState : stateWithExpressionSV;
  }

  function variableDeclaration(declaration: ts.VariableDeclaration) {
    if (ts.isIdentifier(declaration.name)) {
      let [value, nextState] = state.popSV();
      const variable = symbolAt(declaration.name);
      if (!variable || !shouldTrackSymbol(variable)) {
        return nextState;
      }

      if (!value) {
        value = undefinedSymbolicValue();
      }
      return nextState.setSV(variable, value);
    }
    return state;
  }

  function callExpression(callExpression: ts.CallExpression) {
    let nextState = state;
    callExpression.arguments.forEach(_ => (nextState = nextState.popSV()[1]));
    nextState = nextState.popSV()[1]; // Pop callee value
    return nextState.pushSV(simpleSymbolicValue());
  }

  function objectLiteralExpression() {
    // TODO it's not so simple. We need to pop plenty of things here
    return state.pushSV(objectLiteralSymbolicValue());
  }

  function propertyAccessExpression() {
    return state.popSV()[1].pushSV(simpleSymbolicValue());
  }

  function postfixUnaryExpression(unary: ts.PostfixUnaryExpression) {
    let nextState = state;
    const operand = unary.operand;
    const sv = simpleSymbolicValue();
    if (ts.isIdentifier(operand)) {
      const symbol = symbolAt(operand);
      if (symbol) {
        nextState = nextState.setSV(symbol, sv);
      }
    }
    return nextState.popSV()[1].pushSV(sv);
  }

  function symbolAt(node: ts.Node) {
    return (symbols.getUsage(node) || { symbol: null }).symbol;
  }
}
