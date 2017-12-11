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
import { is } from "../utils/navigation";

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
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public visitBinaryExpression(expression: ts.BinaryExpression) {
    if (this.isAssignment(expression) && !this.hasAccessors(expression.left) && this.isSelfAssignment(expression)) {
      this.addFailureAtNode(expression, Rule.formatMessage());
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

  private isIdentifier(expression: ts.Expression) {
    return is(expression, ts.SyntaxKind.Identifier);
  }

  private hasAccessors(node: ts.Node) {
    const symbol = this.getTypeChecker().getSymbolAtLocation(node);
    const declarations = symbol && symbol.declarations;
    return (
      declarations &&
      declarations.some(declaration => is(declaration, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor))
    );
  }

  private isArrayWithSpreadExpressionOnly(expression: ts.Expression, variable: ts.Node): boolean {
    if (is(expression, ts.SyntaxKind.ArrayLiteralExpression)) {
      const elements = (expression as ts.ArrayLiteralExpression).elements;

      if (elements.length === 1 && is(elements[0], ts.SyntaxKind.SpreadElement)) {
        return areEquivalent((elements[0] as ts.SpreadElement).expression, variable);
      }
    }

    return false;
  }

  private isArrayReverseAssignment(left: ts.Expression, right: ts.Expression): boolean {
    // in case of `a = a.reverse()`, left is `a` and right is `a.reverse()`
    return (
      this.isCallExpression(right) &&
      this.isPropertyAccessExpression(right.expression) &&
      this.isIdentifier(right.expression.expression) &&
      this.isArrayMutatingCall(right.expression) &&
      areEquivalent(right.expression.expression, left)
    );
  }

  private isArrayMutatingCall(expression: ts.PropertyAccessExpression): boolean {
    return nav.isArray(expression.expression, this.getTypeChecker()) && 
           nav.ARRAY_MUTATING_CALLS.includes(expression.name.text);
  }

  private isCallExpression(expression: ts.Expression): expression is ts.CallExpression {
    return expression.kind === ts.SyntaxKind.CallExpression;
  }

  private isPropertyAccessExpression(expression: ts.Expression): expression is ts.PropertyAccessExpression {
    return expression.kind === ts.SyntaxKind.PropertyAccessExpression;
  }
}
