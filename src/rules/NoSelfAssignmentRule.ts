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

// https://jira.sonarsource.com/browse/RSPEC-1656

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-self-assignment",
    description: "Variables should not be self-assigned",
    rationale: tslint.Utils.dedent`
      There is no reason to re-assign a variable to itself. Either this statement is redundant and
      should be removed, or the re-assignment is a mistake and some other value or variable was
      intended for the assignment instead.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1656",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage() {
    return "Remove or correct this useless self-assignment.";
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitBinaryExpression(expression: ts.BinaryExpression) {
    if (
      this.isAssignment(expression) &&
      this.isIdentifier(expression.left) &&
      expression.left.getText() === expression.right.getText()
    ) {
      this.addFailureAtNode(expression, Rule.formatMessage());
    }

    super.visitBinaryExpression(expression);
  }

  private isAssignment(expression: ts.BinaryExpression) {
    return expression.operatorToken.kind === ts.SyntaxKind.EqualsToken;
  }

  private isIdentifier(expression: ts.Expression) {
    return expression.kind === ts.SyntaxKind.Identifier;
  }
}
