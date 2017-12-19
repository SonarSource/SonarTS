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
import * as Lint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import { is } from "../utils/navigation";

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    description: "Redundant pairs of parentheses should be removed",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-1110",
    ruleName: "no-redundant-parentheses",
    type: "maintainability",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends Lint.RuleWalker {
  private static readonly MESSAGE = "Remove these useless parentheses.";

  visitNode(node: ts.Node): void {
    if (is(node, ts.SyntaxKind.ParenthesizedExpression)) {
      const parenthesizedExpression = node as ts.ParenthesizedExpression;
      if (is(parenthesizedExpression.expression, ts.SyntaxKind.ParenthesizedExpression)) {
        this.addFailureAtNode(node, Walker.MESSAGE);
      }
    }
    super.visitNode(node);
  }
}
