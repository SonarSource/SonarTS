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
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import {
  isIfStatement,
  isBlock,
  isIterationStatement,
  isFunctionExpression,
  isArrowFunction,
  is,
} from "../utils/nodes";
import { startLineAndCharacter, endLineAndCharacter } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-statements-same-line",
    description: "Statements should be on separate lines",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-122",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = "Reformat the code to have only one statement per line.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    const visitor = new Visitor(this.getOptions().ruleName).visit(sourceFile);

    visitor.statementsPerLine.forEach(statements => {
      if (statements.length > 1) {
        const issue = visitor.addIssue(statements[1], Rule.MESSAGE);
        statements.slice(2).forEach(statement => issue.addSecondaryLocation(statement));
      }
    });

    return visitor.getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  statementsPerLine: Map<number, ts.Statement[]> = new Map();
  excludedStatements: Set<ts.Statement> = new Set();

  private static readonly STATEMENT_KINDS = [
    ts.SyntaxKind.VariableStatement,
    ts.SyntaxKind.ExpressionStatement,
    ts.SyntaxKind.IfStatement,
    ts.SyntaxKind.DoStatement,
    ts.SyntaxKind.WhileStatement,
    ts.SyntaxKind.ForStatement,
    ts.SyntaxKind.ForInStatement,
    ts.SyntaxKind.ForOfStatement,
    ts.SyntaxKind.ContinueStatement,
    ts.SyntaxKind.BreakStatement,
    ts.SyntaxKind.ReturnStatement,
    ts.SyntaxKind.WithStatement,
    ts.SyntaxKind.SwitchStatement,
    ts.SyntaxKind.ThrowStatement,
    ts.SyntaxKind.TryStatement,
    ts.SyntaxKind.DebuggerStatement,
  ];

  public visitNode(node: ts.Node) {
    if (isIfStatement(node)) {
      this.checkForExcludedStatement(node.thenStatement, node);
    }

    if (isIterationStatement(node)) {
      this.checkForExcludedStatement(node.statement, node);
    }

    if (isFunctionExpression(node) || isArrowFunction(node)) {
      this.checkFunctionException(node);
    }

    if (is(node, ...Visitor.STATEMENT_KINDS) && !this.excludedStatements.has(node as ts.Statement)) {
      const line = startLineAndCharacter(node).line;
      const statementsOnThisLine = this.statementsPerLine.get(line) || [];
      statementsOnThisLine.push(node as ts.Statement);
      this.statementsPerLine.set(line, statementsOnThisLine);
    }

    super.visitNode(node);
  }

  private checkFunctionException(functionExpression: ts.FunctionExpression | ts.ArrowFunction) {
    if (isBlock(functionExpression.body)) {
      const startLineOfFunction = startLineAndCharacter(functionExpression).line;
      const statements = functionExpression.body.statements;
      if (
        statements.length === 1 &&
        startLineAndCharacter(statements[0]).line === startLineOfFunction &&
        this.statementsPerLine.has(startLineOfFunction)
      ) {
        this.excludedStatements.add(statements[0]);
      }
    }
  }

  private checkForExcludedStatement(nestedStatement: ts.Statement, nestingStatement: ts.Statement) {
    const startOfNestingStatement = startLineAndCharacter(nestingStatement);
    const endOfNestedStatement = endLineAndCharacter(nestedStatement);
    if (isBlock(nestedStatement)) {
      if (endOfNestedStatement.line === startOfNestingStatement.line && nestedStatement.statements.length === 1) {
        this.excludedStatements.add(nestedStatement.statements[0]);
      }
    } else {
      const startOfNestedStatement = startLineAndCharacter(nestedStatement);

      if (startOfNestedStatement.line === startOfNestingStatement.line) {
        this.excludedStatements.add(nestedStatement);
      }
    }
  }
}
