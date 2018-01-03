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
import { SonarRuleVisitor } from "../utils/sonar-analysis";
import { isStringLiteral, isBinaryExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-case-with-or",
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
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitCaseClause(node: ts.CaseClause) {
    const chain = this.pickBarBarChain(node.expression);
    if (chain !== undefined) {
      // avoid double quotes around string literals
      const left = isStringLiteral(chain.left) ? chain.left.getText() : `"${chain.left.getText()}"`;
      this.addIssue(
        node.expression,
        `Explicitly specify ${chain.count} separate cases that fall through; ` +
          `currently this case clause only works for ${left}.`,
      );
    }

    super.visitCaseClause(node);
  }

  private pickBarBarChain(expression: ts.Expression) {
    let current = expression;
    let count = 0;
    while (isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      count++;
      current = current.left;
    }
    return count > 0 ? { left: current, count: count + 1 } : undefined;
  }
}
