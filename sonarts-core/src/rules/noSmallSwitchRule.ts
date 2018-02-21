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

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-small-switch",
    description: `"switch" statements should have at least 3 "case" clauses`,
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1301",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = `Replace this "switch" statement with "if" statements to increase readability.`;

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitSwitchStatement(node: ts.SwitchStatement) {
    let hasDefault = false;

    const clauses = node.caseBlock.clauses;

    clauses.forEach(clause => {
      if (is(clause, ts.SyntaxKind.DefaultClause)) {
        hasDefault = true;
      }
    });

    if (clauses.length < 2 || (clauses.length === 2 && hasDefault)) {
      this.addIssue(node.getFirstToken(), Rule.MESSAGE);
    }

    super.visitSwitchStatement(node);
  }
}
