/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
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
import { FUNCTION_LIKE } from "./navigation";

// Note: keep all type guards ordered aphabetically

export function is(node: ts.Node | undefined, ...kinds: ts.SyntaxKind[]) {
  return node !== undefined && kinds.includes(node.kind);
}

export function isArrayBindingPattern(node: ts.Node): node is ts.ArrayBindingPattern {
  return is(node, ts.SyntaxKind.ArrayBindingPattern);
}

export function isArrayLiteralExpression(node: ts.Node): node is ts.ArrayLiteralExpression {
  return is(node, ts.SyntaxKind.ArrayLiteralExpression);
}

export function isArrowFunction(node: ts.Node): node is ts.ArrowFunction {
  return is(node, ts.SyntaxKind.ArrowFunction);
}

export function isAssignment(node: ts.Node): node is ts.BinaryExpression {
  return isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

export function isAssignmentKind(kind: ts.SyntaxKind) {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

export function isBinaryExpression(node: ts.Node): node is ts.BinaryExpression {
  return is(node, ts.SyntaxKind.BinaryExpression);
}

export function isBindingElement(node: ts.Node): node is ts.BindingElement {
  return is(node, ts.SyntaxKind.BindingElement);
}

export function isBlock(node: ts.Node): node is ts.Block {
  return is(node, ts.SyntaxKind.Block);
}

export function isBreakStatement(node: ts.Node): node is ts.BreakStatement {
  return is(node, ts.SyntaxKind.BreakStatement);
}

export function isCallExpression(node: ts.Node): node is ts.CallExpression {
  return is(node, ts.SyntaxKind.CallExpression);
}

export function isCaseClause(node: ts.Node): node is ts.CaseClause {
  return is(node, ts.SyntaxKind.CaseClause);
}

export function isCatchClause(node: ts.Node): node is ts.CatchClause {
  return is(node, ts.SyntaxKind.CatchClause);
}

export function isContinueStatement(node: ts.Node): node is ts.ContinueStatement {
  return is(node, ts.SyntaxKind.ContinueStatement);
}

export function isElementAccessExpression(node: ts.Node): node is ts.ElementAccessExpression {
  return is(node, ts.SyntaxKind.ElementAccessExpression);
}

export function isExpressionStatement(node: ts.Node): node is ts.ExpressionStatement {
  return is(node, ts.SyntaxKind.ExpressionStatement);
}

export function isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration {
  return is(node, ts.SyntaxKind.FunctionDeclaration);
}

export function isFunctionLikeDeclaration(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return is(node, ...FUNCTION_LIKE);
}

export function isIdentifier(node: ts.Node): node is ts.Identifier {
  return is(node, ts.SyntaxKind.Identifier);
}

export function isInterfaceDeclaration(node: ts.Node): node is ts.InterfaceDeclaration {
  return is(node, ts.SyntaxKind.InterfaceDeclaration);
}

export function isIfStatement(node: ts.Node): node is ts.IfStatement {
  return is(node, ts.SyntaxKind.IfStatement);
}

export function isLabeledStatement(node: ts.Node): node is ts.LabeledStatement {
  return is(node, ts.SyntaxKind.LabeledStatement);
}

export function isLiteralExpression(node: ts.Node): node is ts.LiteralExpression {
  return ts.SyntaxKind.FirstLiteralToken <= node.kind && node.kind <= ts.SyntaxKind.LastLiteralToken;
}

export function isNewExpression(node: ts.Node): node is ts.NewExpression {
  return is(node, ts.SyntaxKind.NewExpression);
}

export function isNumericLiteral(node: ts.Node): node is ts.NumericLiteral {
  return is(node, ts.SyntaxKind.NumericLiteral);
}

export function isObjectBindingPattern(node: ts.Node): node is ts.ObjectBindingPattern {
  return is(node, ts.SyntaxKind.ObjectBindingPattern);
}

export function isObjectLiteralExpression(node: ts.Node): node is ts.ObjectLiteralExpression {
  return is(node, ts.SyntaxKind.ObjectLiteralExpression);
}

export function isParenthesizedExpression(node: ts.Node): node is ts.ParenthesizedExpression {
  return is(node, ts.SyntaxKind.ParenthesizedExpression);
}

export function isPostfixUnaryExpression(node: ts.Node): node is ts.PostfixUnaryExpression {
  return is(node, ts.SyntaxKind.PostfixUnaryExpression);
}

export function isPrefixUnaryExpression(node: ts.Node): node is ts.PrefixUnaryExpression {
  return is(node, ts.SyntaxKind.PrefixUnaryExpression);
}

export function isPropertyAccessExpression(node: ts.Node): node is ts.PropertyAccessExpression {
  return is(node, ts.SyntaxKind.PropertyAccessExpression);
}

export function isPropertyAssignment(node: ts.Node): node is ts.PropertyAssignment {
  return is(node, ts.SyntaxKind.PropertyAssignment);
}

export function isReturnStatement(node: ts.Node): node is ts.ReturnStatement {
  return is(node, ts.SyntaxKind.ReturnStatement);
}

export function isShorthandPropertyAssignment(node: ts.Node): node is ts.ShorthandPropertyAssignment {
  return is(node, ts.SyntaxKind.ShorthandPropertyAssignment);
}

export function isSpreadAssignment(node: ts.Node): node is ts.SpreadAssignment {
  return is(node, ts.SyntaxKind.SpreadAssignment);
}

export function isSpreadElement(node: ts.Node): node is ts.SpreadElement {
  return is(node, ts.SyntaxKind.SpreadElement);
}

export function isStringLiteral(node: ts.Node): node is ts.StringLiteral {
  return is(node, ts.SyntaxKind.StringLiteral);
}

export function isToken(node: ts.Node) {
  return node.kind <= ts.SyntaxKind.OfKeyword;
}

export function isThrowStatement(node: ts.Node): node is ts.ThrowStatement {
  return is(node, ts.SyntaxKind.ThrowStatement);
}

export function isTypeNode(node: ts.Node): node is ts.TypeNode {
  return (
    (node.kind >= ts.SyntaxKind.FirstTypeNode && node.kind <= ts.SyntaxKind.LastTypeNode) ||
    node.kind === ts.SyntaxKind.AnyKeyword ||
    node.kind === ts.SyntaxKind.NumberKeyword ||
    node.kind === ts.SyntaxKind.ObjectKeyword ||
    node.kind === ts.SyntaxKind.BooleanKeyword ||
    node.kind === ts.SyntaxKind.StringKeyword ||
    node.kind === ts.SyntaxKind.SymbolKeyword ||
    node.kind === ts.SyntaxKind.ThisKeyword ||
    node.kind === ts.SyntaxKind.VoidKeyword ||
    node.kind === ts.SyntaxKind.UndefinedKeyword ||
    node.kind === ts.SyntaxKind.NullKeyword ||
    node.kind === ts.SyntaxKind.NeverKeyword ||
    node.kind === ts.SyntaxKind.ExpressionWithTypeArguments ||
    node.kind === ts.SyntaxKind.JSDocAllType ||
    node.kind === ts.SyntaxKind.JSDocUnknownType ||
    node.kind === ts.SyntaxKind.JSDocNullableType ||
    node.kind === ts.SyntaxKind.JSDocNonNullableType ||
    node.kind === ts.SyntaxKind.JSDocOptionalType ||
    node.kind === ts.SyntaxKind.JSDocFunctionType ||
    node.kind === ts.SyntaxKind.JSDocVariadicType
  );
}

export function isVariableDeclaration(node: ts.Node): node is ts.VariableDeclaration {
  return is(node, ts.SyntaxKind.VariableDeclaration);
}

export function isVariableDeclarationList(node: ts.Node): node is ts.VariableDeclarationList {
  return is(node, ts.SyntaxKind.VariableDeclarationList);
}

export function isVariableStatement(node: ts.Node): node is ts.VariableStatement {
  return is(node, ts.SyntaxKind.VariableStatement);
}

export function isUnionOrIntersectionTypeNode(node: ts.Node): node is ts.UnionOrIntersectionTypeNode {
  return is(node, ts.SyntaxKind.UnionType, ts.SyntaxKind.IntersectionType);
}
