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
    ruleName: "no-logical-or-in-switch-case",
    description: "Logical OR should not be used in switch cases",
    rationale: tslint.Utils.dedent`
      The logical OR operator (||) will not work in a switch case as one might think, only the first argument will be 
      considered at execution time.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3616",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitCaseClause(node: ts.CaseClause) {
    const chain = this.pickBarBarLiteralChain(node.expression);
    if (chain !== undefined) {
      // avoid double quotes around string literals
      const left = ts.isStringLiteral(chain.left) ? chain.left.getText() : `"${chain.left.getText()}"`;
      this.addFailureAtNode(
        node.expression,
        `Explicitly specify ${chain.elements} separate cases that fall through; ` +
          `currently this case clause only works for ${left}.`,
      );
    }

    super.visitCaseClause(node);
  }

  private pickBarBarLiteralChain(expression: ts.Expression) {
    let current = expression;
    let elements = 0;
    while (ts.isBinaryExpression(current) && ts.isLiteralExpression(current.right)) {
      elements++;
      current = current.left;
    }
    return elements > 0 && ts.isLiteralExpression(current) ? { left: current, elements: elements + 1 } : undefined;
  }
}
