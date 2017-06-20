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
import { SonarRuleMetaData } from "../sonarRule";
import areEquivalent from "../utils/areEquivalent";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-identical-expressions",
    description: "Identical expressions should not be used on both sides of a binary operator",
    rationale: tslint.Utils.dedent`
      Using the same value on either side of a binary operator is almost always a
      mistake. In the case of logical operators, it is either a copy/paste error and therefore a
      bug, or it is simply wasted code, and should be simplified. In the case of bitwise
      operators and most binary mathematical operators, having the same value on both sides of an
      operator yields predictable results, and should be simplified.
      This rule ignores *, +, and =.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1764",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(operator: string) {
    return `Correct one of the identical sub-expressions on both sides of operator "${operator}"`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  private static EQUALITY_OPERATOR_TOKEN_KINDS = new Set([
    ts.SyntaxKind.EqualsEqualsToken, // ==
    ts.SyntaxKind.EqualsEqualsEqualsToken, // ===
    ts.SyntaxKind.ExclamationEqualsToken, // !=
    ts.SyntaxKind.ExclamationEqualsEqualsToken, // !==
  ]);

  // consider only binary expressions with these operators
  private static RELEVANT_OPERATOR_TOKEN_KINDS = new Set([
    ts.SyntaxKind.AmpersandAmpersandToken, // &&
    ts.SyntaxKind.BarBarToken, // ||

    ts.SyntaxKind.SlashToken, // /
    ts.SyntaxKind.MinusToken, // -
    ts.SyntaxKind.LessThanLessThanToken, // <<
    ts.SyntaxKind.GreaterThanGreaterThanToken, // >>

    ts.SyntaxKind.LessThanToken, // <
    ts.SyntaxKind.LessThanEqualsToken, // <=
    ts.SyntaxKind.GreaterThanToken, // >
    ts.SyntaxKind.GreaterThanEqualsToken, // >=
  ]);

  public visitBinaryExpression(node: ts.BinaryExpression) {
    if (this.hasRelevantOperator(node) && !this.isOneOntoOneShifting(node) && areEquivalent(node.left, node.right)) {
      this.addFailureAtNode(node, Rule.formatMessage(node.operatorToken.getText()));
    }

    super.visitBinaryExpression(node);
  }

  private hasRelevantOperator(node: ts.BinaryExpression) {
    return (
      Walker.RELEVANT_OPERATOR_TOKEN_KINDS.has(node.operatorToken.kind) ||
      (Walker.EQUALITY_OPERATOR_TOKEN_KINDS.has(node.operatorToken.kind) && !this.hasIdentifierOperands(node))
    );
  }

  private hasIdentifierOperands(node: ts.BinaryExpression) {
    return node.left.kind === ts.SyntaxKind.Identifier;
  }

  private isOneOntoOneShifting(node: ts.BinaryExpression) {
    return (
      node.operatorToken.kind === ts.SyntaxKind.LessThanLessThanToken &&
      node.left.kind === ts.SyntaxKind.NumericLiteral &&
      node.left.getText() === "1"
    );
  }
}
