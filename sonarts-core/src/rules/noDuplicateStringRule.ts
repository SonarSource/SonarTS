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

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-duplicate-string",
    description: "String literals should not be duplicated",
    rationale: tslint.Utils.dedent``,
    rspecKey: "RSPEC-1192",
    type: "maintainability",
    typescriptOnly: false,
    optionsDescription: `Number of times a literal must be duplicated to trigger an issue. Default is ${Rule.DEFAULT_THRESHOLD}.`,
    options: { type: "number" },
    optionExamples: [true, [true, 5]],
  };

  static readonly DEFAULT_THRESHOLD = 3;
  static readonly MIN_LENGTH = 10;

  private get threshold(): number {
    return this.ruleArguments[0] || Rule.DEFAULT_THRESHOLD;
  }

  public static message(times: number) {
    return `Define a constant instead of duplicating this literal ${times} times.`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.threshold).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  private readonly literals: Map<string, ts.StringLiteral[]> = new Map();
  private static readonly noSeparatorRegexp = /^\w*$/;

  constructor(ruleName: string, private readonly threshold: number) {
    super(ruleName);
  }

  visitStringLiteral(node: ts.StringLiteral) {
    const stringContent: string = getStringContent(node);

    if (stringContent.length >= Rule.MIN_LENGTH && !stringContent.match(Visitor.noSeparatorRegexp)) {
      const sameStringLiterals = this.literals.get(stringContent) || [];
      sameStringLiterals.push(node);
      this.literals.set(stringContent, sameStringLiterals);
    }

    super.visitStringLiteral(node);
  }

  visitSourceFile(node: ts.SourceFile) {
    super.visitSourceFile(node);

    this.literals.forEach(literals => {
      if (literals.length >= this.threshold) {
        this.addIssue(literals[0], Rule.message(literals.length)).setCost(literals.length - 1);
      }
    });
  }
}

function getStringContent(node: ts.StringLiteral) {
  return node.getText().substr(1, node.getText().length - 2);
}
