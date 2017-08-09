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

const Kind = ts.SyntaxKind;

export function keyword(node: ts.BreakOrContinueStatement | ts.ThrowStatement | ts.ReturnStatement): ts.Node {
  return node.getFirstToken();
}

export function isAssignment(node: ts.Node | undefined): node is ts.BinaryExpression {
  return (
    !!node &&
    node.kind === ts.SyntaxKind.BinaryExpression &&
    (node as ts.BinaryExpression).operatorToken.kind === ts.SyntaxKind.EqualsToken
  );
}

export function retrievePureIdentifier(node: ts.Node): ts.Identifier | undefined {
  if (node.kind === ts.SyntaxKind.Identifier) return node as ts.Identifier;
  if (node.kind === ts.SyntaxKind.ParenthesizedExpression)
    return retrievePureIdentifier((node as ts.ParenthesizedExpression).expression);
  return undefined;
}

export function getComments(node: ts.Node): ts.CommentRange[] {
  return [...getCommentsBefore(node), ...getCommentsAfter(node)];
}

export function getCommentsBefore(node: ts.Node): ts.CommentRange[] {
  return ts.getLeadingCommentRanges(node.getSourceFile().text, node.getFullStart()) || [];
}

export function getCommentsAfter(node: ts.Node): ts.CommentRange[] {
  return ts.getTrailingCommentRanges(node.getSourceFile().text, node.getEnd()) || [];
}

export function getText(textRange: ts.TextRange, file: ts.SourceFile): string {
  return file.getFullText().substr(textRange.pos, textRange.end - textRange.pos);
}

export function toTokens(node: ts.Node): ts.Node[] {
  const result: ts.Node[] = [];
  const stack: ts.Node[] = [node];

  while (stack.length) {
    const currentNode = stack.pop() as ts.Node;
    if (isToken(currentNode)) {
      result.push(currentNode);
      continue;
    }

    // skip jsDoc
    if (currentNode.kind === ts.SyntaxKind.FirstJSDocTagNode) {
      continue;
    }

    stack.push(...currentNode.getChildren());
  }

  return result.reverse();
}

export function lineAndCharacter(pos: number, file: ts.SourceFile): ts.LineAndCharacter {
  return file.getLineAndCharacterOfPosition(pos);
}

export function is(node: ts.Node | undefined, ...kinds: ts.SyntaxKind[]): boolean {
  if (!node) return false;
  for (const kind of kinds) {
    if (node.kind === kind) {
      return true;
    }
  }
  return false;
}

function isToken(node: ts.Node): boolean {
  return node.kind <= ts.SyntaxKind.OfKeyword;
}

export function ancestorsChain(node: ts.Node, boundary = FUNCTION_LIKE): ts.Node[] {
  const chain: ts.Node[] = [];
  for (let parent = node.parent; !!parent; parent = parent.parent) {
    chain.push(parent);
    if (boundary.includes(parent.kind)) break;
  }
  return chain;
}

export function firstAncestor(
  node: ts.Node,
  targetAncestor: ts.SyntaxKind[],
  boundary = FUNCTION_LIKE,
): ts.Node | undefined {
  return ancestorsChain(node, boundary).find(ancestor => targetAncestor.includes(ancestor.kind));
}

export function floatToTopParenthesis(node: ts.Node): ts.Node {
  if (is(node, ts.SyntaxKind.ParenthesizedExpression)) {
    if (node.parent) return floatToTopParenthesis(node.parent);
    return node;
  }
  return node;
}

export function drillDownThroughParenthesis(node: ts.Node): ts.Node {
  if (is(node, ts.SyntaxKind.ParenthesizedExpression))
    return drillDownThroughParenthesis((node as ts.ParenthesizedExpression).expression);
  return node;
}

export function descendants(node: ts.Node): ts.Node[] {
  const children = node.getChildren();
  let collectedDescendants = children;
  children.forEach(child => (collectedDescendants = collectedDescendants.concat(descendants(child))));
  return collectedDescendants;
}

export const FUNCTION_LIKE = [
  Kind.FunctionDeclaration,
  Kind.FunctionExpression,
  Kind.ArrowFunction,
  Kind.MethodDeclaration,
  Kind.Constructor,
  Kind.GetAccessor,
  Kind.SetAccessor,
];
export const CONDITIONAL_STATEMENTS = [Kind.IfStatement, Kind.SwitchStatement];
export const LOOP_STATEMENTS = [
  Kind.ForStatement,
  Kind.ForInStatement,
  Kind.ForOfStatement,
  Kind.WhileStatement,
  Kind.DoStatement,
];
