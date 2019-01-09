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
import { functionLikeMainToken, drillDownThroughParenthesis } from "../utils/navigation";
import {
  is,
  isPrefixUnaryExpression,
  isBinaryExpression,
  isReturnStatement,
  isIdentifier,
  isPropertyAccessExpression,
  isBlock,
} from "../utils/nodes";

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
    `Declare this function return type using type predicate "${parameterName} is ${typeName}".`;

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (!is(node, ts.SyntaxKind.Constructor, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor)) {
      this.checkFunctionLikeDeclaration(node);
    }
    super.visitFunctionLikeDeclaration(node);
  }

  private checkFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (node.type && is(node.type, ts.SyntaxKind.TypePredicate)) {
      return;
    }
    const { parameters, body } = node;
    const returnExpression = this.returnedExpression(body);
    if (!returnExpression) {
      return;
    }

    if (this.isInequalityBinaryExpression(returnExpression)) {
      const { left, right } = returnExpression;
      if (this.isUndefined(right)) {
        this.checkCastedType(node, parameters.length, left);
      }
    } else if (this.isNegation(returnExpression) && this.isNegation(returnExpression.operand)) {
      this.checkCastedType(node, parameters.length, returnExpression.operand.operand);
    }
  }

  private checkCastedType(node: ts.FunctionLikeDeclaration, nOfParam: number, expression: ts.Expression) {
    const castedType = this.getCastedTypeFromPropertyAccess(expression);
    if (!castedType || castedType.type.kind === ts.SyntaxKind.AnyKeyword) {
      return;
    }
    const { expression: castedExpression, type } = castedType;
    if (nOfParam === 1 || (nOfParam === 0 && is(castedExpression, ts.SyntaxKind.ThisKeyword))) {
      this.addIssue(functionLikeMainToken(node), Rule.MESSAGE(castedExpression.getText(), type.getText()));
    }
  }

  private isInequalityBinaryExpression(returnExpression: ts.Expression): returnExpression is ts.BinaryExpression {
    return (
      isBinaryExpression(returnExpression) &&
      is(
        returnExpression.operatorToken,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
      )
    );
  }

  private isNegation(node: ts.Expression): node is ts.PrefixUnaryExpression {
    return isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken;
  }

  private getCastedTypeFromPropertyAccess(node: ts.Expression) {
    node = drillDownThroughParenthesis(node);
    if (isPropertyAccessExpression(node)) {
      const expression = drillDownThroughParenthesis(node.expression);
      if (is(expression, ts.SyntaxKind.AsExpression, ts.SyntaxKind.TypeAssertionExpression)) {
        return expression as ts.AssertionExpression;
      }
    }
    return undefined;
  }

  private isUndefined(node: ts.Expression) {
    return isIdentifier(node) && node.text === "undefined";
  }

  private returnedExpression(body?: ts.Block | ts.Expression): ts.Expression | undefined {
    if (!body) {
      return undefined;
    }
    if (isBlock(body)) {
      return body.statements.length === 1 && isReturnStatement(body.statements[0])
        ? (body.statements[0] as ts.ReturnStatement).expression
        : undefined;
    }
    return body;
  }
}
