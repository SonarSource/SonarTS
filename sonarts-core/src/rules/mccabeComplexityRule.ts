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
import { is, FUNCTION_LIKE, functionLikeMainToken } from "../utils/navigation";
import { getFunctionComplexityNodes } from "../utils/complexity";

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
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), this.threshold));
  }
}

class Walker extends tslint.RuleWalker {
  threshold: number;

  constructor(sourceFile: ts.SourceFile, options: tslint.IOptions, threshold: number) {
    super(sourceFile, options);
    this.threshold = threshold;
  }

  public visitNode(node: ts.Node) {
    if (is(node, ...FUNCTION_LIKE)) {
      const functionComplexity = getFunctionComplexityNodes(node as ts.FunctionLikeDeclaration).length;
      if (functionComplexity > this.threshold) {
        this.addFailureAtNode(
          functionLikeMainToken(node as ts.FunctionLikeDeclaration),
          Rule.message(functionComplexity, this.threshold),
        );
      }
    }

    super.visitNode(node);
  }
}
