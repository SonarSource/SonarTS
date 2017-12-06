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
import { SpreadElement, ArrayLiteralExpression } from "typescript";
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
    if (this.isDetectedPattern(expression) && this.shouldReportFailure(expression)) {
      this.addFailureAtNode(expression, Rule.formatMessage());
    }

    super.visitBinaryExpression(expression);
  }

  private isDetectedPattern(expression: ts.BinaryExpression): boolean {
    return this.isAssignment(expression) &&
          (this.isIdentifier(expression.left) || this.isPropertyWithNoAccessors(expression.left));
  }

  private shouldReportFailure(expression: ts.BinaryExpression): boolean {
    return areEquivalent(expression.left, expression.right) ||
           this.isArrayWithSpreadExpressionOnly(expression.right, expression.left) ||
           this.isArrayReverseAssignment(expression.left, expression.right);
  }

  private isAssignment(expression: ts.BinaryExpression) {
    return is(expression.operatorToken, ts.SyntaxKind.EqualsToken);
  }

  private isIdentifier(expression: ts.Expression) {
    return is(expression, ts.SyntaxKind.Identifier);
  }

  private isPropertyWithNoAccessors(expression: ts.Expression) {
    return is(expression, ts.SyntaxKind.PropertyAccessExpression) && !this.hasAccessors(expression);
  }

  private hasAccessors(node: ts.Node) {
    const symbol = this.getTypeChecker().getSymbolAtLocation(node);
    const declarations = symbol && symbol.declarations;
    return declarations && declarations.some(declaration => is(declaration, ts.SyntaxKind.GetAccessor, ts.SyntaxKind.SetAccessor))
  }

  private isArrayWithSpreadExpressionOnly(expression: ts.Expression, variable: ts.Node) : boolean {
    const arrayLiteral = expression as ArrayLiteralExpression;
    if (!arrayLiteral || !arrayLiteral.elements || arrayLiteral.elements.length !== 1) {
      return false;
    }

    const spread = arrayLiteral.elements[0] as SpreadElement;
    return spread && spread.expression && areEquivalent(spread.expression, variable);
  }

  private isArrayReverseAssignment(left: ts.Expression, right: ts.Expression): boolean {
    // in case of `a = a.reverse()`, left is `a` and right is `a.reverse()`
    return (
      this.isCallExpression(right) &&
      this.isPropertyAccessExpression(right.expression) &&
      this.isIdentifier(right.expression.expression) &&
      this.isArray(right.expression.expression) &&
      right.expression.name.text === "reverse" &&
      areEquivalent(right.expression.expression, left)
    );
  }

  private isCallExpression(expression: ts.Expression): expression is ts.CallExpression {
    return expression.kind === ts.SyntaxKind.CallExpression;
  }

  private isPropertyAccessExpression(expression: ts.Expression): expression is ts.PropertyAccessExpression {
    return expression.kind === ts.SyntaxKind.PropertyAccessExpression;
  }

  private isArray(node: ts.Node): boolean {
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return !!type.symbol && type.symbol.name === "Array";
  }
}
