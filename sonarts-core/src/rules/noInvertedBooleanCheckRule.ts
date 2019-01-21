/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { isParenthesizedExpression, isBinaryExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-inverted-boolean-check",
    description: "Boolean checks should not be inverted",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1940",
    type: "maintainability",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  private static readonly invertedOperatorsByKind: { [kind: string]: string } = {
    [ts.SyntaxKind.EqualsEqualsToken]: "!=",
    [ts.SyntaxKind.ExclamationEqualsToken]: "==",
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: "!==",
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "===",
  };

  visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    if (node.operator === ts.SyntaxKind.ExclamationToken) {
      let operand: ts.Expression = node.operand;
      while (isParenthesizedExpression(operand)) {
        operand = operand.expression;
      }

      if (isBinaryExpression(operand)) {
        const invertedOperator = Visitor.invertedOperatorsByKind[operand.operatorToken.kind];
        if (invertedOperator) {
          this.addIssue(node, `Use the opposite operator (\"${invertedOperator}\") instead.`);
        }
      }
    }

    super.visitPrefixUnaryExpression(node);
  }
}
