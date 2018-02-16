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
import { functionLikeMainToken } from "../utils/navigation";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "parameters-max-number",
    description: "Functions should not have too many parameters",
    rationale: tslint.Utils.dedent``,
    options: { type: "number" },
    optionsDescription: `Maximum authorized number of parameters. Default is ${Rule.DEFAULT_MAX}.`,
    optionExamples: [[true, 5]],
    rspecKey: "RSPEC-107",
    type: "maintainability",
    typescriptOnly: false,
  };

  private static DEFAULT_MAX = 7;

  static message(parametersNumber: number, max: number) {
    return `This function has ${parametersNumber} parameters, which is greater than the ${max} authorized.`;
  }

  private get max(): number {
    if (this.ruleArguments[0] !== undefined) {
      return this.ruleArguments[0] as number;
    }
    return Rule.DEFAULT_MAX;
  }

  public applyWithProgram(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, this.max).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(ruleName: string, readonly max: number) {
    super(ruleName);
  }

  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (node.parameters.length > this.max) {
      this.addIssue(functionLikeMainToken(node), Rule.message(node.parameters.length, this.max));
    }

    super.visitFunctionLikeDeclaration(node);
  }
}
