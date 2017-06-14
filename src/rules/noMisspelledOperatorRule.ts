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

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-misspelled-operator",
    description: "Non-existent operators '=+', '=-' and '=!' should not be used",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2757",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(suggestedOperator: string) {
    return `Was "${suggestedOperator}" meant instead?`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  private static readonly COMPOUND_ASSIGNMENT_OPERATORS = new Map()
    .set(ts.SyntaxKind.PlusToken, "+=")
    .set(ts.SyntaxKind.MinusToken, "-=")
    .set(ts.SyntaxKind.ExclamationToken, "!=");

  public visitBinaryExpression(node: ts.BinaryExpression) {
    if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const expression = node.right;
      if (expression.kind === ts.SyntaxKind.PrefixUnaryExpression) {
        const unaryExpression = expression as ts.PrefixUnaryExpression;
        const unaryOperator = unaryExpression.getFirstToken();
        if (
          this.isPresentInCompoundAssignments(unaryOperator) &&
          this.areAdjacent(node.operatorToken, unaryOperator) &&
          !this.areAdjacent(unaryOperator, unaryExpression.operand)
        ) {
          this.addOperatorFailure(node.operatorToken, unaryOperator);
        }
      }
    }

    super.visitBinaryExpression(node);
  }

  private isPresentInCompoundAssignments(operator: ts.Node): boolean {
    return Walker.COMPOUND_ASSIGNMENT_OPERATORS.has(operator.kind);
  }

  private areAdjacent(left: ts.Node, right: ts.Node): boolean {
    return left.getEnd() === right.getStart();
  }

  private suggestOperator(unaryOperator: ts.Node): string {
    return Walker.COMPOUND_ASSIGNMENT_OPERATORS.get(unaryOperator.kind);
  }

  private addOperatorFailure(previousOperator: ts.Node, unaryOperator: ts.Node) {
    this.addFailureAt(
      previousOperator.getStart(),
      previousOperator.getWidth() + unaryOperator.getWidth(),
      Rule.formatMessage(this.suggestOperator(unaryOperator)),
    );
  }
}
