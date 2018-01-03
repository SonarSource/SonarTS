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
import { functionLikeMainToken } from "../utils/navigation";
import { getFunctionComplexityNodes } from "../utils/cyclomaticComplexity";
import { SonarRuleVisitor, getIssueLocationAtNode } from "../utils/sonar-analysis";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "mccabe-complexity",
    description: "Functions should not be too complex",
    rspecKey: "RSPEC-1541",
    type: "maintainability",
    typescriptOnly: false,
    optionsDescription: `The maximum authorized complexity can be provided. Default is ${Rule.DEFAULT_THRESHOLD}.`,
    options: { type: "number" },
    optionExamples: [true, [true, 15]],
  };

  public static DEFAULT_THRESHOLD = 10;

  private get threshold(): number {
    if (this.ruleArguments[0] !== undefined) {
      return this.ruleArguments[0] as number;
    }
    return Rule.DEFAULT_THRESHOLD;
  }

  public static message(complexity: number, threshold: number) {
    return `The Cyclomatic Complexity of this function is ${complexity} which is greater than ${threshold} authorized.`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions(), this.threshold).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(options: tslint.IOptions, private readonly threshold: number) {
    super(options.ruleName);
  }

  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    const complexityNodes = getFunctionComplexityNodes(node);
    const functionComplexity = complexityNodes.length;
    if (functionComplexity > this.threshold) {
      const issue = this.addIssue(functionLikeMainToken(node), Rule.message(functionComplexity, this.threshold));
      issue.setCost(functionComplexity - this.threshold);
      complexityNodes.forEach(node => issue.addSecondaryLocation(getIssueLocationAtNode(node, "+1")));
    }

    super.visitFunctionLikeDeclaration(node);
  }
}
