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
import { findChild } from "../utils/navigation";
import { isIfStatement } from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-collapsible-if",
    description: 'Collapsible "if" statements should be merged',
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1066",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = "Merge this if statement with the enclosing one.";
  public static SECONDARY_MESSAGE = 'Enclosing "if" statement';

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  protected visitIfStatement(node: ts.IfStatement) {
    let then = node.thenStatement;
    if (then.kind === ts.SyntaxKind.Block) {
      const thenBlock = then as ts.Block;
      if (thenBlock.statements.length === 1) {
        then = thenBlock.statements[0];
      }
    }
    if (this.isIfStatementWithoutElse(node) && this.isIfStatementWithoutElse(then)) {
      const issue = this.addIssue(this.ifKeyword(then), Rule.MESSAGE);
      issue.addSecondaryLocation(this.ifKeyword(node), Rule.SECONDARY_MESSAGE);
    }
    super.visitIfStatement(node);
  }

  private isIfStatementWithoutElse(node: ts.Statement): boolean {
    return isIfStatement(node) && node.elseStatement == null;
  }

  private ifKeyword(node: ts.Statement) {
    return findChild(node, ts.SyntaxKind.IfKeyword);
  }
}
