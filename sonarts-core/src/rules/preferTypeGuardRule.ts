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
import { functionLikeMainToken } from "../utils/navigation";
import { is } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-type-guard",
    description: "Type guards should be used",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4322",
    type: "maintainability",
    typescriptOnly: true,
  };

  public static MESSAGE = (parameterName: string, typeName: string) =>
    `Change this boolean return type into the type predicate "${parameterName} is ${typeName}".`;

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    this.checkFunctionDeclaration(node);
    super.visitFunctionDeclaration(node);
  }

  visitMethodDeclaration(node: ts.MethodDeclaration) {
    this.checkFunctionDeclaration(node);
    super.visitMethodDeclaration(node);
  }

  private checkFunctionDeclaration(node: ts.FunctionDeclaration | ts.MethodDeclaration) {
    if (node.type && ts.isTypePredicateNode(node.type)) {
      return;
    }
    const { parameters, body } = node;
    const returnExpression = this.returnExpression(body);
    if (parameters.length !== 1 || !returnExpression) {
      return;
    }
    if (this.isInequalityBinaryExpression(returnExpression)) {
      const { left, right } = returnExpression;
      const castedType = this.getCastedTypeFromPropertyAccess(left);
      if (this.isUndefined(right) && castedType) {
        this.addIssue(functionLikeMainToken(node), Rule.MESSAGE(parameters[0].name.getText(), castedType));
      }
    } else if (this.isNegation(returnExpression) && this.isNegation(returnExpression.operand)) {
      const castedType = this.getCastedTypeFromPropertyAccess(returnExpression.operand.operand);
      if (castedType) {
        this.addIssue(functionLikeMainToken(node), Rule.MESSAGE(parameters[0].name.getText(), castedType));
      }
    }
  }

  private isInequalityBinaryExpression(returnExpression: ts.Expression): returnExpression is ts.BinaryExpression {
    return (
      ts.isBinaryExpression(returnExpression) &&
      is(
        returnExpression.operatorToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
      )
    );
  }

  private isNegation(node: ts.Expression): node is ts.PrefixUnaryExpression {
    return ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken;
  }

  private getCastedTypeFromPropertyAccess(node: ts.Expression) {
    if (ts.isParenthesizedExpression(node)) {
      node = node.expression;
    }

    if (is(node, ts.SyntaxKind.PropertyAccessExpression)) {
      let expression: ts.Expression = (node as ts.PropertyAccessExpression).expression;
      if (ts.isParenthesizedExpression(expression)) {
        expression = expression.expression;
      }
      if (is(expression, ts.SyntaxKind.AsExpression, ts.SyntaxKind.TypeAssertionExpression)) {
        const assertionExpression = expression as ts.AssertionExpression;
        return assertionExpression.type.kind !== ts.SyntaxKind.AnyKeyword
          ? assertionExpression.type.getText()
          : undefined;
      }
    }
    return false;
  }

  private isUndefined(node: ts.Expression) {
    return ts.isIdentifier(node) && node.text === "undefined";
  }

  private returnExpression(body?: ts.Block): ts.Expression | undefined {
    if (body && body.statements.length === 1 && ts.isReturnStatement(body.statements[0])) {
      return (body.statements[0] as ts.ReturnStatement).expression;
    }
  }
}
