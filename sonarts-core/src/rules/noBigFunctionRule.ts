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
import { startLineAndCharacter, endLineAndCharacter, functionLikeMainToken } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-big-function",
    description: "Functions should not have too many lines of code",
    rationale: tslint.Utils.dedent``,
    rspecKey: "RSPEC-138",
    type: "maintainability",
    typescriptOnly: false,
    options: { type: "number" },
    optionsDescription: `Maximum authorized lines of code in a function. Default is ${Rule.DEFAULT_MAX}.`,
    optionExamples: [[true, 100]],
  };

  private static readonly DEFAULT_MAX = 200;

  private get max(): number {
    return this.ruleArguments[0] || Rule.DEFAULT_MAX;
  }

  public static message(functionSize: number, max: number) {
    return `This function has ${functionSize} lines, which is greater than the ${max} lines authorized. Split it into smaller functions.`;
  }

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.max).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(ruleName: string, private readonly max: number) {
    super(ruleName);
  }

  visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (node.body) {
      const startLine = startLineAndCharacter(node.body).line;
      const endLine = endLineAndCharacter(node.body).line;
      const functionSize = endLine - startLine;
      if (functionSize > this.max) {
        this.addIssue(functionLikeMainToken(node), Rule.message(functionSize, this.max));
      }
    }

    super.visitFunctionLikeDeclaration(node);
  }
}
