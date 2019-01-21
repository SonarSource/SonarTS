/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { findChild } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "max-switch-cases",
    description: `"switch" statements should not have too many "case" clauses`,
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: { type: "number" },
    optionExamples: [true, [true, 15]],
    rspecKey: "RSPEC-1479",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static DEFAULT_MAXIMUM = 30;

  private get maximum(): number {
    if (this.ruleArguments[0] !== undefined) {
      return this.ruleArguments[0] as number;
    }
    return Rule.DEFAULT_MAXIMUM;
  }

  public static message = (actual: number, max: number) =>
    `Reduce the number of non-empty switch cases from ${actual} to at most ${max}.`;

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.maximum).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(ruleName: string, private readonly maximum: number) {
    super(ruleName);
  }

  visitSwitchStatement(node: ts.SwitchStatement) {
    const nonEmptyCases = node.caseBlock.clauses.filter(
      switchCase => switchCase.statements.length > 0 && !is(switchCase, ts.SyntaxKind.DefaultClause),
    );

    if (nonEmptyCases.length > this.maximum) {
      this.addIssue(findChild(node, ts.SyntaxKind.SwitchKeyword), Rule.message(nonEmptyCases.length, this.maximum));
    }

    super.visitSwitchStatement(node);
  }
}
