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

export function applyExecutors(element: ts.Node, state: ProgramState, program: ts.Program): ProgramState {
  const { parent } = element;

  // TODO is there a better way to handle this?
  // special case: `let x;`
  if (parent && tsutils.isVariableDeclaration(parent) && parent.name === element && !parent.initializer) {
    return variableDeclaration(parent, state, program);
  }

  if (tsutils.isNumericLiteral(element)) {
    return numeralLiteral(element, state, program);
  }

  if (tsutils.isIdentifier(element)) {
    return identifier(element, state, program);
  }

  if (tsutils.isBinaryExpression(element)) {
    return binaryExpression(element, state, program);
  }

  if (tsutils.isVariableDeclaration(element)) {
    return variableDeclaration(element, state, program);
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
  if (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken && tsutils.isIdentifier(expression.left)) {
    return assign(expression.left, expression.right, state, program);
  }
  return state;
}

function variableDeclaration(declaration: ts.VariableDeclaration, state: ProgramState, program: ts.Program) {
  if (tsutils.isIdentifier(declaration.name)) {
    return assign(declaration.name, declaration.initializer, state, program);
  }
  return state;
}

function assign(
  variableIdentifier: ts.Identifier,
  value: ts.Expression | undefined,
  state: ProgramState,
  program: ts.Program,
) {
  const { getSymbolAtLocation } = program.getTypeChecker();
  const variable = getSymbolAtLocation(variableIdentifier);
  if (!variable) {
    return state;
  }
  let valueSV;
  if (value) {
    [valueSV, state] = state.popSV();
  } else {
    valueSV = createUndefinedSymbolicValue();
  }
  return state.pushSV(valueSV).setSV(variable, valueSV);
}
