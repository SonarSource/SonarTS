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

export function getComments(node: ts.Node): ts.CommentRange[] {
  const result: ts.CommentRange[] = [];
  const commentsAfter = ts.getTrailingCommentRanges(node.getSourceFile().text, node.getEnd());
  const commentsBefore = ts.getLeadingCommentRanges(node.getSourceFile().text, node.getFullStart());

  [commentsAfter, commentsBefore].forEach(comments => {
    if (comments) {
      result.push(...comments);
    }
  });

  return result;
}

export function getText(textRange: ts.TextRange, file: ts.SourceFile): string {
  return file.getText().substr(textRange.pos, textRange.end - textRange.pos);
}

export function toTokens(node: ts.Node): ts.Node[] {
  if (isToken(node)) {
    return [node];
  }

  const result: ts.Node[] = [];
  node.getChildren().forEach(child => {
    result.push(...toTokens(child));
  });
  return result;
}

export function is(node: ts.Node, ...kinds: ts.SyntaxKind[]): boolean {
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
