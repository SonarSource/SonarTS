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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.??See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA??02110-1301, USA.
 */
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import { TypedSonarRuleVisitor } from "../utils/sonar-analysis";
import { isArray } from "../utils/semantics";
import { SyntaxKind, SpreadElement } from "typescript";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-double-rest-parameters",
    description: "Rest parameters should not be passed as rest arguments",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4412",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Use spread operator '...' to pass this argument";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  protected visitCallExpression(node: ts.CallExpression) {
    const { arguments: callArguments, expression } = node;
    if (callArguments.length > 0) {
      const lastArgument = callArguments[callArguments.length - 1];
      if (/*ts.isIdentifier(lastArgument) && */ isArray(lastArgument, this.program.getTypeChecker())) {
        //if (lastArgument.kind === SyntaxKind.SpreadElement && isArray((lastArgument as SpreadElement).expression, this.program.getTypeChecker())){
        const calleeType = this.program.getTypeChecker().getTypeAtLocation(expression);
        const callSignature =
          calleeType.getCallSignatures().length === 1 ? calleeType.getCallSignatures()[0] : undefined;
        if (callSignature) {
          const parameters = callSignature.getDeclaration().parameters;
          const lastParameter =
            parameters.length === callArguments.length ? parameters[parameters.length - 1] : undefined;
          if (
            lastParameter &&
            lastParameter.dotDotDotToken &&
            lastParameter.type &&
            (lastParameter.type.getText() === "any[]" || lastParameter.type.getText() === "Array<any>")
          ) {
            this.addIssue(lastArgument, Rule.MESSAGE);
          }
        }
      }
    }

    super.visitCallExpression(node);
  }
}
