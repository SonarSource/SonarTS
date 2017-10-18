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
    description: "Errors should not be created without being thrown",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-3984",
    ruleName: "no-unthrown-error",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  protected visitNewExpression(node: ts.NewExpression): void {
    super.visitNewExpression(node);
    if (this.isWithinExpressionStatement(node) && this.looksLikeAnError(node.expression)) {
      this.addFailureAtNode(node, `Throw this error or remove this useless statement`);
    }
  }

  private isWithinExpressionStatement(node: ts.NewExpression): boolean {
    return !!node.parent && node.parent.kind === ts.SyntaxKind.ExpressionStatement;
  }

  private looksLikeAnError(expression: ts.Expression): boolean {
    const text = expression.getText();
    return text.endsWith("Error") || text.endsWith("Exception");
  }
}
