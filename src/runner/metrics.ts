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
import * as tslint from "tslint";
import * as ts from "typescript";
import { getComments, getCommentsAfter, getText, is, lineAndCharacter, toTokens } from "../utils/navigation";

export default function getMetrics(
  sourceFile: ts.SourceFile,
): {
  ncloc: number[];
  commentLines: number[];
  nosonarLines: number[];
  functions: number;
  statements: number;
  classes: number;
} {

  const linesOfCode: Set<number> = new Set();
  const commentLines: Set<number> = new Set();
  const nosonarLines: Set<number> = new Set();
  const tokens = toTokens(sourceFile);

  // CODE
  tokens.forEach(token => {
    if (token.kind !== ts.SyntaxKind.EndOfFileToken) {
      addLines(token.getStart(), token.getEnd(), linesOfCode, sourceFile);
    }
  });

  // COMMENTS
  // ignore header comments -> comments before first token
  getCommentsAfter(tokens[0]).forEach(processComment);
  tokens.slice(1).forEach(token => getComments(token).forEach(processComment));

  const counter = new CounterWalker();
  counter.walk(sourceFile);

  return {
    ncloc: Array.from(linesOfCode),
    commentLines: Array.from(commentLines),
    nosonarLines: Array.from(nosonarLines),
    functions: counter.functions,
    statements: counter.statements,
    classes: counter.classes,
  };

  function processComment(comment: ts.CommentRange) {
    const content = getText(comment, sourceFile).substr(2);
    if (content.trim().toUpperCase().startsWith("NOSONAR")) {
      addLines(comment.pos, comment.end, nosonarLines, sourceFile);
    }
    addLines(comment.pos, comment.end, commentLines, sourceFile);
  }
}

class CounterWalker extends tslint.SyntaxWalker {
  public functions = 0;
  public statements = 0;
  public classes = 0;

  private static readonly FUNCTION_KINDS = [
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.ArrowFunction,
  ];

  protected visitNode(node: ts.Node): void {
    if (is(node, ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.ClassExpression)) {
      this.classes++;
    }

    if (is(node, ...CounterWalker.FUNCTION_KINDS)) {
      this.functions++;
    }

    if (node.kind >= ts.SyntaxKind.VariableStatement && node.kind <= ts.SyntaxKind.DebuggerStatement) {
      this.statements++;
    }

    super.visitNode(node);
  }
}

function addLines(start: number, end: number, lines: Set<number>, sourceFile: ts.SourceFile) {
  const firstLine = toSonarLine(lineAndCharacter(start, sourceFile).line);
  const lastLine = toSonarLine(lineAndCharacter(end, sourceFile).line);

  for (let i = firstLine; i <= lastLine; i++) {
    lines.add(i);
  }
}

function toSonarLine(line: number) {
  return line + 1;
}
