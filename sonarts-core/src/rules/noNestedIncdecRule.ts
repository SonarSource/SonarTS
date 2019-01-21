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
import { isBinaryExpression, isPrefixUnaryExpression, isPostfixUnaryExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-nested-incdec",
    description:
      "Increment (++) and decrement (--) operators should not be used in a method call or mixed with other operators in an expression",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-881",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE_INC = "Extract this increment operation into a dedicated statement.";
  public static MESSAGE_DEC = "Extract this decrement operation into a dedicated statement.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

const incDecOperators = [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken];

class Visitor extends SonarRuleVisitor {
  public visitExpressionStatement(node: ts.ExpressionStatement) {
    if (isIncDec(node.expression)) {
      // skipping visit visitPrefixUnaryExpression/visitPostfixUnaryExpression if increment/decrement
      this.visitNode((node.expression as ts.PrefixUnaryExpression).operand);
    } else {
      super.visitExpressionStatement(node);
    }
  }

  public visitForStatement(node: ts.ForStatement) {
    node.initializer && this.visitNode(node.initializer);
    node.condition && this.visitNode(node.condition);
    node.incrementor && this.visitIncrementor(node.incrementor);
    this.visitNode(node.statement);
  }

  public visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.checkUnaryExpression(node);
    super.visitPrefixUnaryExpression(node);
  }

  public visitPostfixUnaryExpression(node: ts.PostfixUnaryExpression) {
    this.checkUnaryExpression(node);
    super.visitPostfixUnaryExpression(node);
  }

  private visitIncrementor(node: ts.Expression) {
    if (isIncDec(node)) {
      this.visitNode((node as ts.PrefixUnaryExpression).operand);
    } else if (isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.CommaToken) {
      this.visitIncrementor(node.left);
      this.visitIncrementor(node.right);
    } else {
      this.visitNode(node);
    }
  }

  private checkUnaryExpression(node: ts.PrefixUnaryExpression | ts.PostfixUnaryExpression) {
    if (node.operator === ts.SyntaxKind.PlusPlusToken) {
      this.addIssue(node, Rule.MESSAGE_INC);
    } else if (node.operator === ts.SyntaxKind.MinusMinusToken) {
      this.addIssue(node, Rule.MESSAGE_DEC);
    }
  }
}

function isIncDec(node: ts.Expression) {
  return (isPrefixUnaryExpression(node) || isPostfixUnaryExpression(node)) && incDecOperators.includes(node.operator);
}
