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
import areEquivalent from "../utils/areEquivalent";
import { isArray, ARRAY_MUTATING_CALLS } from "../utils/semantics";
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import {
  is,
  isCallExpression,
  isPropertyAccessExpression,
  isIdentifier,
  isArrayLiteralExpression,
  isSpreadElement,
} from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-self-assignment",
    description: "Variables should not be self-assigned",
    rationale: tslint.Utils.dedent`
      There is no reason to re-assign a variable to itself. Either this statement is redundant and
      should be removed, or the re-assignment is a mistake and some other value or variable was
      intended for the assignment instead.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-1656",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage() {
    return "Remove or correct this useless self-assignment.";
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  public visitBinaryExpression(expression: ts.BinaryExpression) {
    if (this.isAssignment(expression) && !this.hasAccessors(expression.left) && this.isSelfAssignment(expression)) {
      this.addIssue(expression, Rule.formatMessage());
    }

    super.visitBinaryExpression(expression);
  }

  private isSelfAssignment(expression: ts.BinaryExpression): boolean {
    return (
      areEquivalent(expression.left, expression.right) ||
      this.isArrayWithSpreadExpressionOnly(expression.right, expression.left) ||
      this.isArrayReverseAssignment(expression.left, expression.right)
    );
  }

  private isAssignment(expression: ts.BinaryExpression) {
    return is(expression.operatorToken, ts.SyntaxKind.EqualsToken);
  }

  private hasAccessors(node: ts.Node) {
    const symbol = this.program.getTypeChecker().getSymbolAtLocation(node);
    const declarations = symbol && symbol.declarations;
    return (
      declarations &&
      declarations.some(declaration => is(declaration, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor))
    );
  }

  private isArrayWithSpreadExpressionOnly(expression: ts.Expression, variable: ts.Node): boolean {
    if (isArrayLiteralExpression(expression)) {
      const { elements } = expression;
      if (elements.length === 1 && isSpreadElement(elements[0])) {
        return areEquivalent((elements[0] as ts.SpreadElement).expression, variable);
      }
    }

    return false;
  }

  private isArrayReverseAssignment(left: ts.Expression, right: ts.Expression): boolean {
    // in case of `a = a.reverse()`, left is `a` and right is `a.reverse()`
    return (
      isCallExpression(right) &&
      isPropertyAccessExpression(right.expression) &&
      isIdentifier(right.expression.expression) &&
      this.isArrayMutatingCall(right.expression) &&
      areEquivalent(right.expression.expression, left)
    );
  }

  private isArrayMutatingCall(expression: ts.PropertyAccessExpression): boolean {
    return (
      isArray(expression.expression, this.program.getTypeChecker()) &&
      ARRAY_MUTATING_CALLS.includes(expression.name.text)
    );
  }
}
