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
import { is } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-redundant-boolean",
    description: "Boolean literals should not be redundant",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1125",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Remove the unnecessary boolean literal.";

  public applyWithProgram(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitBinaryExpression(node: ts.BinaryExpression) {
    if (isOrFalse(node)) {
      if (is(node.parent, ts.SyntaxKind.ConditionalExpression, ts.SyntaxKind.IfStatement)) {
        this.addIssue(node.right, Rule.MESSAGE);
      }
    } else if (
      is(
        node.operatorToken,
        ts.SyntaxKind.EqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
      )
    ) {
      this.check(node.left);
      this.check(node.right);
    }

    super.visitBinaryExpression(node);
  }

  public visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    if (node.operator === ts.SyntaxKind.ExclamationToken) {
      this.check(node.operand);
    }

    super.visitPrefixUnaryExpression(node);
  }

  public visitConditionalExpression(node: ts.ConditionalExpression) {
    if (isBooleanLiteral(node.whenTrue) && isBooleanLiteral(node.whenFalse)) {
      this.addIssue(node, "Simplify this expression.");
    }

    super.visitConditionalExpression(node);
  }

  private check(expr: ts.Expression) {
    if (isBooleanLiteral(expr)) {
      this.addIssue(expr, Rule.MESSAGE);
    }
  }
}

function isBooleanLiteral(expr: ts.Expression) {
  return is(expr, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword);
}

function isOrFalse(node: ts.BinaryExpression) {
  return is(node.operatorToken, ts.SyntaxKind.BarBarToken) && is(node.right, ts.SyntaxKind.FalseKeyword);
}
