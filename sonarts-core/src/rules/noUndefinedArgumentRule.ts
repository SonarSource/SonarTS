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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { isFunctionLikeDeclaration, isIdentifier } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-undefined-argument",
    description: `"undefined" should not be passed as the value of optional parameters`,
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4623",
    type: "maintainability",
    typescriptOnly: false,
  };

  public static MESSAGE = `Remove this redundant "undefined".`;

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  public visitCallExpression(node: ts.CallExpression) {
    const { arguments: args } = node;
    if (args.length === 0) {
      return;
    }

    const lastArgument = args[args.length - 1];
    if (
      isIdentifier(lastArgument) &&
      lastArgument.text === "undefined" &&
      this.isOptionalParameter(args.length - 1, node)
    ) {
      this.addIssue(lastArgument, Rule.MESSAGE);
    }

    super.visitCallExpression(node);
  }

  private isOptionalParameter(parameterIndex: number, node: ts.CallExpression) {
    const signature = this.program.getTypeChecker().getResolvedSignature(node);
    if (signature) {
      const declaration = signature.declaration;
      if (declaration && isFunctionLikeDeclaration(declaration)) {
        const { parameters } = declaration;
        const parameter = parameters[parameterIndex];
        return parameter && (parameter.initializer || parameter.questionToken);
      }
    }
    return false;
  }
}
