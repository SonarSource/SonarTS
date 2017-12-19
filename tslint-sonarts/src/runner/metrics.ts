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
import { getComments, getCommentsAfter, getText, is, lineAndCharacter } from "../utils/navigation";
import { toSonarLine } from "./sonar-utils";

export default function getMetrics(sourceFile: ts.SourceFile): Metrics {
  return {
    ncloc: findLinesOfCode(sourceFile),
    ...findCommentLines(sourceFile),
    executableLines: findExecutableLines(sourceFile),
    functions: countFunctions(sourceFile),
    statements: countStatements(sourceFile),
    classes: countClasses(sourceFile),
  };
}

export interface Metrics {
  ncloc: number[];
  commentLines: number[];
  nosonarLines: number[];
  executableLines: number[];
  functions: number;
  statements: number;
  classes: number;
}

export function findLinesOfCode(sourceFile: ts.SourceFile): number[] {
  const lines: Set<number> = new Set();

  walk(sourceFile, node => {
    if (node.kind <= ts.SyntaxKind.OfKeyword && node.kind !== ts.SyntaxKind.EndOfFileToken) {
      addLines(node.getStart(), node.getEnd(), lines, sourceFile);
    }
  });

  return Array.from(lines).sort((a, b) => a - b);
}

export function findCommentLines(sourceFile: ts.SourceFile): { commentLines: number[]; nosonarLines: number[] } {
  const commentLines: Set<number> = new Set();
  const nosonarLines: Set<number> = new Set();

  // ignore header comments -> comments before first token
  let first = true;

  walk(sourceFile, node => {
    if (node.kind <= ts.SyntaxKind.OfKeyword) {
      if (first) {
        first = false;
        getCommentsAfter(node).forEach(processComment);
      } else {
        getComments(node).forEach(processComment);
      }
    }
  });

  function processComment(comment: ts.CommentRange) {
    const content = getText(comment, sourceFile).substr(2);
    if (
      content
        .trim()
        .toUpperCase()
        .startsWith("NOSONAR")
    ) {
      addLines(comment.pos, comment.end, nosonarLines, sourceFile);
    }
    addLines(comment.pos, comment.end, commentLines, sourceFile);
  }

  return {
    commentLines: Array.from(commentLines).sort((a, b) => a - b),
    nosonarLines: Array.from(nosonarLines).sort((a, b) => a - b),
  };
}

export function findExecutableLines(sourceFile: ts.SourceFile): number[] {
  const EXECUTABLE_STATEMENT_KINDS = [
    ts.SyntaxKind.DebuggerStatement,
    ts.SyntaxKind.VariableStatement,
    ts.SyntaxKind.LabeledStatement,
    ts.SyntaxKind.ReturnStatement,
    ts.SyntaxKind.BreakStatement,
    ts.SyntaxKind.ContinueStatement,
    ts.SyntaxKind.ThrowStatement,
    ts.SyntaxKind.WithStatement,
    ts.SyntaxKind.TryStatement,
    ts.SyntaxKind.SwitchStatement,
    ts.SyntaxKind.IfStatement,
    ts.SyntaxKind.WhileStatement,
    ts.SyntaxKind.DoStatement,
    ts.SyntaxKind.ExpressionStatement,
    ts.SyntaxKind.ForStatement,
    ts.SyntaxKind.ForInStatement,
    ts.SyntaxKind.ForOfStatement,
  ];

  const lines: Set<number> = new Set();

  walk(sourceFile, node => {
    if (EXECUTABLE_STATEMENT_KINDS.includes(node.kind)) {
      lines.add(toSonarLine(lineAndCharacter(node.getStart(), sourceFile).line));
    }
  });

  return Array.from(lines).sort((a, b) => a - b);
}

export function countClasses(sourceFile: ts.SourceFile): number {
  return walkAndCountIf(sourceFile, node => is(node, ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.ClassExpression));
}

export function countFunctions(sourceFile: ts.SourceFile): number {
  const FUNCTION_KINDS = [
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.ArrowFunction,
  ];
  return walkAndCountIf(sourceFile, node => is(node, ...FUNCTION_KINDS));
}

export function countStatements(sourceFile: ts.SourceFile): number {
  return walkAndCountIf(
    sourceFile,
    node => node.kind >= ts.SyntaxKind.VariableStatement && node.kind <= ts.SyntaxKind.DebuggerStatement,
  );
}

function walk(node: ts.Node, walker: (node: ts.Node) => void): void {
  const stack: ts.Node[] = [node];
  const toWalk = [];
  while (stack.length) {
    const currentNode = stack.pop() as ts.Node;
    toWalk.push(currentNode);
    stack.push(...currentNode.getChildren());
  }
  toWalk.reverse().forEach(walker);
}

function walkAndCountIf(root: ts.Node, condition: (node: ts.Node) => boolean): number {
  let results = 0;
  walk(root, node => {
    if (condition(node)) {
      results++;
    }
  });
  return results;
}

function addLines(start: number, end: number, lines: Set<number>, sourceFile: ts.SourceFile) {
  const firstLine = toSonarLine(lineAndCharacter(start, sourceFile).line);
  const lastLine = toSonarLine(lineAndCharacter(end, sourceFile).line);

  for (let i = firstLine; i <= lastLine; i++) {
    lines.add(i);
  }
}
