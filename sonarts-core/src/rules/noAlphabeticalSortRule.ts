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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { isPropertyAccessExpression, is } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-alphabetical-sort",
    description: 'A compare function should be provided when using "Array.prototype.sort()"',
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2871",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Provide a compare function to avoid sorting elements alphabetically.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  visitCallExpression(callExpression: ts.CallExpression) {
    if (callExpression.arguments.length === 0 && isPropertyAccessExpression(callExpression.expression)) {
      const { name, expression } = callExpression.expression;
      if (name.getText() === "sort") {
        const arrayElementType = this.arrayElementType(expression);
        if (arrayElementType && is(arrayElementType, ts.SyntaxKind.NumberKeyword)) {
          this.addIssue(name, Rule.MESSAGE);
        }
      }
    }
    super.visitCallExpression(callExpression);
  }

  private arrayElementType(expression: ts.Expression) {
    const { typeToTypeNode, getTypeAtLocation } = this.program.getTypeChecker();
    const typeNode = typeToTypeNode(getTypeAtLocation(expression));
    if (typeNode && is(typeNode, ts.SyntaxKind.ArrayType)) {
      return (typeNode as ts.ArrayTypeNode).elementType;
    }
    return undefined;
  }
}
