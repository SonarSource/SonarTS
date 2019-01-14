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
import { TypedSonarRuleVisitor, IssueLocation } from "../utils/sonarAnalysis";
import { isIdentifier } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "arguments-order",
    description: "Parameters should be passed in the correct order",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2234",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = `Parameters have the same names but not the same order as the arguments.`;

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  visitCallExpression(node: ts.CallExpression) {
    const argumentNames = this.getArgumentNames(node);
    const { parameterNames, declaration } = this.getSignature(node);

    if (parameterNames) {
      const hasProblem = argumentNames.some((argumentName, argumentIndex) => {
        if (!argumentName) {
          return false;
        }
        return this.isArgumentSwapped(argumentName, argumentIndex, argumentNames, parameterNames, node);
      });

      if (hasProblem) {
        this.raiseIssue(node, declaration);
      }
    }
    super.visitCallExpression(node);
  }

  isArgumentSwapped(
    argumentName: string,
    argumentIndex: number,
    argumentNames: (string | undefined)[],
    parameterNames: ts.Symbol[],
    node: ts.CallExpression,
  ) {
    const parameterIndex = parameterNames.findIndex(param => param.name === argumentName);
    if (parameterIndex > -1 && parameterIndex !== argumentIndex) {
      const anotherArgument = argumentNames[parameterIndex];
      if (parameterNames[argumentIndex].name === anotherArgument) {
        const firstArgumentType = this.getTypeAsString(node.arguments[argumentIndex]);
        const secondArgumentType = this.getTypeAsString(node.arguments[parameterIndex]);

        if (firstArgumentType === secondArgumentType) {
          return true;
        }
      }
    }

    return false;
  }

  getTypeAsString(expr: ts.Expression) {
    const typeChecker = this.program.getTypeChecker();
    return typeChecker.typeToString(typeChecker.getBaseTypeOfLiteralType(typeChecker.getTypeAtLocation(expr)));
  }

  raiseIssue(node: ts.CallExpression, declaration?: ts.SignatureDeclaration | ts.JSDocSignature) {
    const issue = this.addIssueAtLocation(
      new IssueLocation(node.arguments.pos, node.arguments.end, node.getSourceFile(), Rule.MESSAGE),
    );
    if (
      declaration &&
      (declaration.parameters as ts.TextRange).pos &&
      declaration.getSourceFile() === node.getSourceFile()
    ) {
      const textRange: ts.TextRange = declaration.parameters as ts.TextRange;
      issue.addSecondaryLocation(
        new IssueLocation(textRange.pos, textRange.end, node.getSourceFile(), "Formal parameters"),
      );
    }
  }

  getArgumentNames(node: ts.CallExpression) {
    const argumentNames: (string | undefined)[] = [];
    node.arguments.forEach(arg => {
      if (isIdentifier(arg)) {
        argumentNames.push(arg.getText());
      } else {
        argumentNames.push(undefined);
      }
    });

    return argumentNames;
  }

  getSignature(node: ts.CallExpression) {
    const parameterNames: ts.Symbol[] = [];
    const calleeType = this.program.getTypeChecker().getTypeAtLocation(node.expression);
    const callSignatures = calleeType.getCallSignatures();
    if (callSignatures.length === 1) {
      const callSignature = callSignatures[0];
      callSignature.parameters.forEach(parameterSymbol => {
        parameterNames.push(parameterSymbol);
      });

      return { parameterNames, declaration: callSignature.declaration };
    }

    return { parameterNames: undefined, declaration: undefined };
  }
}
