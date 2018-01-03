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
import { FunctionCollector } from "../utils/cognitiveComplexity";
import { SonarRuleVisitor, IssueLocation } from "../utils/sonar-analysis";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "cognitive-complexity",
    description: "Cognitive Complexity of functions should not be too high",
    rationale: tslint.Utils.dedent`
      Cognitive Complexity is a measure of how hard the control flow of a function is to understand.
      Functions with high Cognitive Complexity will be difficult to maintain.`,
    options: { type: "number" },
    optionsDescription: `The maximum authorized complexity. Default is ${Rule.DEFAULT_THRESHOLD}.`,
    optionExamples: [[true, 10]],
    rspecKey: "RSPEC-3776",
    type: "maintainability",
    typescriptOnly: false,
  };

  private get threshold(): number {
    if (this.ruleArguments[0] !== undefined) {
      return this.ruleArguments[0] as number;
    }
    return Rule.DEFAULT_THRESHOLD;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    const visitor = new SonarRuleVisitor(this.getOptions().ruleName);

    const functionCollector = new FunctionCollector();
    functionCollector.visit(sourceFile);

    functionCollector.functionComplexities.forEach(functionComplexity => {
      if (functionComplexity.complexity > this.threshold) {
        const issue = visitor.addIssue(
          functionLikeMainToken(functionComplexity.functionNode),
          getMessage(functionComplexity.functionNode, functionComplexity.complexity, this.threshold),
        );
        issue.setCost(functionComplexity.complexity - this.threshold);
        functionComplexity.nodes.forEach(complexityNode =>
          issue.addSecondaryLocation(
            new IssueLocation(complexityNode.node, secondaryMessage(complexityNode.complexity)),
          ),
        );
      }
    });

    return visitor.getIssues();

    function secondaryMessage(complexity: number) {
      if (complexity > 1) {
        return `+${complexity} (incl. ${complexity - 1} for nesting)`;
      } else {
        return "+" + complexity;
      }
    }
  }

  public static DEFAULT_THRESHOLD = 15;
}

function getMessage(node: ts.Node, complexity: number, threshold: number): string {
  const functionName = getFunctionName(node);
  return `Refactor this ${functionName} to reduce its Cognitive Complexity from ${complexity} to the ${threshold} allowed.`;
}

function getFunctionName(node: ts.Node): string {
  switch (node.kind) {
    case ts.SyntaxKind.MethodDeclaration:
      return "method";
    case ts.SyntaxKind.Constructor:
      return "constructor";
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
      return "accessor";
    default:
      return "function";
  }
}
