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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as ts from "typescript";
import * as nodes from "./nodes";

const Kind = ts.SyntaxKind;

export function keyword(node: ts.BreakOrContinueStatement | ts.ThrowStatement | ts.ReturnStatement): ts.Node {
  return findChild(
    node,
    ts.SyntaxKind.BreakKeyword,
    ts.SyntaxKind.ContinueKeyword,
    ts.SyntaxKind.ThrowKeyword,
    ts.SyntaxKind.ReturnKeyword,
  );
}

export function collectLeftHandIdentifiers(
  node: ts.Expression,
): { identifiers: ts.Identifier[]; nonIdentifiers: ts.Expression[] } {
  const identifiers: ts.Identifier[] = [];
  const nonIdentifiers: ts.Expression[] = [];
  collectFromExpression(node);
  identifiers.reverse();
  nonIdentifiers.reverse();
  return { identifiers, nonIdentifiers };

  function collectFromExpression(node: ts.Expression) {
    node = drillDownThroughParenthesis(node);
    if (nodes.isIdentifier(node)) {
      identifiers.push(node);
    } else if (nodes.isObjectLiteralExpression(node)) {
      collectFromObjectLiteralExpression(node);
    } else if (nodes.isArrayLiteralExpression(node)) {
      node.elements.forEach(element => collectFromExpression(element));
    } else if (nodes.isSpreadElement(node)) {
      collectFromExpression(node.expression);
    } else if (nodes.isBinaryExpression(node)) {
      collectFromExpression(node.left);
      nonIdentifiers.push(node.right);
    } else {
      nonIdentifiers.push(node);
    }
  }

  function collectFromObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
    node.properties.forEach(property => {
      if (nodes.isPropertyAssignment(property)) {
        collectFromExpression(property.initializer);
      } else if (nodes.isShorthandPropertyAssignment(property)) {
        collectFromExpression(property.name);
        if (property.objectAssignmentInitializer) {
          nonIdentifiers.push(property.objectAssignmentInitializer);
        }
      } else if (nodes.isSpreadAssignment(property)) {
        collectFromExpression(property.expression);
      }
    });
  }
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
    if (nodes.isToken(currentNode)) {
      result.push(currentNode);
      continue;
    }

    // skip jsDoc
    if (currentNode.kind >= ts.SyntaxKind.FirstJSDocNode && currentNode.kind <= ts.SyntaxKind.LastJSDocNode) {
      continue;
    }

    stack.push(...currentNode.getChildren());
  }

  return result.reverse();
}

export function lineAndCharacterByPos(pos: number, file: ts.SourceFile): ts.LineAndCharacter {
  return file.getLineAndCharacterOfPosition(pos);
}

export function startLineAndCharacter(node: ts.Node): ts.LineAndCharacter {
  return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
}

export function endLineAndCharacter(node: ts.Node): ts.LineAndCharacter {
  return node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());
}

export function localAncestorsChain(node: ts.Node): ts.Node[] {
  return ancestorsChain(node, ...FUNCTION_LIKE);
}

export function ancestorsChain(node: ts.Node, ...boundary: ts.SyntaxKind[]) {
  const chain: ts.Node[] = [];
  for (let parent = node.parent; !!parent; parent = parent.parent) {
    chain.push(parent);
    if (boundary.includes(parent.kind)) break;
  }
  return chain;
}

export function firstLocalAncestor(node: ts.Node, ...targetAncestor: ts.SyntaxKind[]) {
  return firstAncestor(node, targetAncestor, ...FUNCTION_LIKE);
}

export function firstAncestor(
  node: ts.Node,
  targetAncestor: ts.SyntaxKind[],
  ...boundary: ts.SyntaxKind[]
): ts.Node | undefined {
  return ancestorsChain(node, ...boundary).find(ancestor => targetAncestor.includes(ancestor.kind));
}

export function floatToTopParenthesis(node: ts.Node): ts.Node {
  return nodes.isParenthesizedExpression(node) && node.parent ? floatToTopParenthesis(node.parent) : node;
}

export function drillDownThroughParenthesis(node: ts.Expression): ts.Expression {
  return nodes.isParenthesizedExpression(node) ? drillDownThroughParenthesis(node.expression) : node;
}

/** Returns all descendants of the `node`, including tokens */
export function descendants(node: ts.Node): ts.Node[] {
  const children = node.getChildren();
  let collectedDescendants = children;
  children.forEach(child => (collectedDescendants = collectedDescendants.concat(descendants(child))));
  return collectedDescendants;
}

export function findChild(node: ts.Node, ...kind: ts.SyntaxKind[]): ts.Node {
  const child = node.getChildren().find(child => nodes.is(child, ...kind));
  if (child) {
    return child;
  } else {
    throw new Error("Not found child with kind " + kind.map(k => ts.SyntaxKind[k]));
  }
}

export function accessModifier(
  declaration: ts.MethodDeclaration | ts.ParameterDeclaration | ts.AccessorDeclaration,
): ts.Modifier | undefined {
  if (declaration.modifiers) {
    return declaration.modifiers.find(modifier => nodes.is(modifier, ...ACCESS_MODIFIERS));
  } else {
    return;
  }
}

export function isReadonly(declaration: ts.MethodDeclaration | ts.ParameterDeclaration): ts.Modifier | undefined {
  if (declaration.modifiers) {
    return declaration.modifiers.find(modifier => nodes.is(modifier, ts.SyntaxKind.ReadonlyKeyword));
  } else {
    return;
  }
}

export function constructorOf(clazz: ts.ClassDeclaration | ts.ClassExpression): ts.ConstructorDeclaration | undefined {
  return clazz.members.find(member => member.kind === ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration;
}

/**
 * Returns
 * - function name token for methods and accessors
 * - "function" keyword for function declarations and expressions
 * - "=>" for arrow function
 */
export function functionLikeMainToken(functionNode: ts.FunctionLikeDeclaration): ts.Node {
  switch (functionNode.kind) {
    case Kind.FunctionDeclaration:
    case Kind.FunctionExpression:
      return getFirstChild(functionNode, ts.SyntaxKind.FunctionKeyword)!;
    case Kind.ArrowFunction:
      return functionNode.equalsGreaterThanToken;
    case Kind.Constructor:
      return getFirstChild(functionNode, ts.SyntaxKind.ConstructorKeyword)!;
    case Kind.MethodDeclaration:
    case Kind.GetAccessor:
    case Kind.SetAccessor:
      return (functionNode as ts.MethodDeclaration).name;
  }
}

export function getFirstChild(node: ts.Node, childKind: ts.SyntaxKind): ts.Node | undefined {
  return node.getChildren().find(child => child.kind === childKind);
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

export const COMPOUND_ASSIGNMENTS = [
  Kind.PlusEqualsToken,
  Kind.MinusEqualsToken,
  Kind.AsteriskAsteriskEqualsToken,
  Kind.AsteriskEqualsToken,
  Kind.SlashEqualsToken,
  Kind.PercentEqualsToken,
  Kind.AmpersandEqualsToken,
  Kind.BarEqualsToken,
  Kind.CaretEqualsToken,
  Kind.LessThanLessThanEqualsToken,
  Kind.GreaterThanGreaterThanGreaterThanEqualsToken,
  Kind.GreaterThanGreaterThanEqualsToken,
];

export const ACCESS_MODIFIERS = [Kind.PublicKeyword, Kind.PrivateKeyword, Kind.ProtectedKeyword];
