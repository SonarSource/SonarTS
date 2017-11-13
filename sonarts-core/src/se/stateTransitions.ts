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
import * as tsutils from "tsutils";
import { createLiteralSymbolicValue, createUnknownSymbolicValue, createUndefinedSymbolicValue } from "./symbolicValues";
import { ProgramState } from "./programStates";
import { SymbolicValue } from "./symbolicValues";

export function applyExecutors(programPoint: ts.Node, state: ProgramState, program: ts.Program): ProgramState {
  const { parent } = programPoint;

  // TODO is there a better way to handle this?
  // special case: `let x;`
  if (parent && tsutils.isVariableDeclaration(parent) && parent.name === programPoint && !parent.initializer) {
    return variableDeclaration(parent, state, program);
  }

  if (tsutils.isNumericLiteral(programPoint)) {
    return numeralLiteral(programPoint, state, program);
  }

  if (tsutils.isIdentifier(programPoint)) {
    return identifier(programPoint, state, program);
  }

  if (tsutils.isBinaryExpression(programPoint)) {
    return binaryExpression(programPoint, state, program);
  }

  if (tsutils.isVariableDeclaration(programPoint)) {
    return variableDeclaration(programPoint, state, program);
  }

  if (tsutils.isCallExpression(programPoint)) {
    return callExpression(state);
  }

  return state;
}

function identifier(identifier: ts.Identifier, state: ProgramState, program: ts.Program) {
  const symbol = program.getTypeChecker().getSymbolAtLocation(identifier);
  if (symbol) {
    const sv = state.sv(symbol) || createUnknownSymbolicValue();
    return state.pushSV(sv);
  }
  return state;
}

function numeralLiteral(literal: ts.NumericLiteral, state: ProgramState, _program: ts.Program) {
  return state.pushSV(createLiteralSymbolicValue(literal.text));
}

function binaryExpression(expression: ts.BinaryExpression, state: ProgramState, program: ts.Program) {
  if (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    let [value, nextState] = state.popSV();
    const { getSymbolAtLocation } = program.getTypeChecker();
    const variable = getSymbolAtLocation(expression.left as ts.Identifier);
    if (!variable) {
      return nextState;
    }

    if (!value) {
      throw "Assignment without value";
    }
    nextState = nextState.pushSV(value);
  
    return nextState.setSV(variable, value);
  }
  return state;
}

function variableDeclaration(declaration: ts.VariableDeclaration, state: ProgramState, program: ts.Program) {
  if (tsutils.isIdentifier(declaration.name)) {
    let [value, nextState] = state.popSV();
    const { getSymbolAtLocation } = program.getTypeChecker();
    const variable = getSymbolAtLocation(declaration.name);    
    if (!variable) {
      return nextState;
    }

    if (!value) {
      value = createUndefinedSymbolicValue();
    }
  
    return nextState.setSV(variable, value);
  }
  return state;
}

function callExpression(state: ProgramState) {
  return state.pushSV(createUnknownSymbolicValue());
}
