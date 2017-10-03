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
    ruleName: "no-useless-increment",
    description: "Values should not be uselessly incremented",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2123",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  private static readonly MESSAGE_INC = "Remove this increment or correct the code not to waste it.";
  private static readonly MESSAGE_DEC = "Remove this decrement or correct the code not to waste it.";

  public visitBinaryExpression(node: ts.BinaryExpression): void {
    if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const rightOperand = node.right;
      const leftOperand = node.left;

      if (rightOperand.kind === ts.SyntaxKind.PostfixUnaryExpression) {
        const postfixUnaryExpr = rightOperand as ts.PostfixUnaryExpression;

        if (areEquivalent(leftOperand, postfixUnaryExpr.operand)) {
          this.addFailureAtNode(
            postfixUnaryExpr.getChildAt(1),
            postfixUnaryExpr.operator === ts.SyntaxKind.PlusPlusToken ? Walker.MESSAGE_INC : Walker.MESSAGE_DEC,
          );
        }
      }
    }
  }
}
