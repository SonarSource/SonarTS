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
  isIdentifier,
  isFunctionLikeDeclaration,
  isBlock,
  isExpressionStatement,
  isCallExpression,
} from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-promise-shorthand",
    description: "Shorthand promises should be used",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4634",
    type: "maintainability",
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

function message(value: ts.Node, action: PromiseAction) {
  return `Replace this trivial promise with "Promise.${action}(${value.getText()})".`;
}

class Visitor extends SonarRuleVisitor {
  protected visitNewExpression(node: ts.NewExpression) {
    const executor = getPromiseExecutor(node);
    if (executor) {
      this.checkExecutor(executor, node);
    }
    super.visitNewExpression(node);
  }

  private checkExecutor(executor: ts.Expression, newExpression: ts.NewExpression) {
    if (isFunctionLikeDeclaration(executor) && executor.body) {
      const { parameters, body } = executor;
      const [resolveParameterDeclaration, rejectParameterDeclaration] = parameters;
      const resolveParameterName = getParameterName(resolveParameterDeclaration);
      const rejectParameterName = getParameterName(rejectParameterDeclaration);

      const bodyExpression = getOnlyBodyExpression(body);

      if (bodyExpression && isCallExpression(bodyExpression)) {
        const { expression: callee, arguments: callArguments } = bodyExpression;
        if (isIdentifier(callee)) {
          const action = getPromiseAction(callee.text, resolveParameterName, rejectParameterName);
          if (action && callArguments.length === 1) this.addIssue(newExpression, message(callArguments[0], action));
        }
      }
    }
  }
}

function getPromiseExecutor(node: ts.NewExpression) {
  if (
    isIdentifier(node.expression) &&
    node.expression.text === "Promise" &&
    node.arguments &&
    node.arguments.length === 1
  ) {
    return node.arguments[0];
  }

  return undefined;
}

function getOnlyBodyExpression(body: ts.ConciseBody) {
  let bodyExpression: ts.Expression | undefined;
  if (isBlock(body)) {
    if (body.statements.length === 1) {
      const statement = body.statements[0];
      if (isExpressionStatement(statement)) {
        bodyExpression = statement.expression;
      }
    }
  } else {
    bodyExpression = body;
  }
  return bodyExpression;
}

function getPromiseAction(
  callee: string,
  resolveParameterName: string | null,
  rejectParameterName: string | null,
): PromiseAction | undefined {
  switch (callee) {
    case resolveParameterName:
      return "resolve";
    case rejectParameterName:
      return "reject";
  }
}

function getParameterName(parameterDeclaration?: ts.ParameterDeclaration) {
  return parameterDeclaration && isIdentifier(parameterDeclaration.name) ? parameterDeclaration.name.text : null;
}

type PromiseAction = "resolve" | "reject";
