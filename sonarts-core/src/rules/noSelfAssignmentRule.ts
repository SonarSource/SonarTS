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
import { SpreadElement } from "typescript";

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
    if (this.isAssignment(expression) && this.isIdentifier(expression.left)) {
      if (this.isIdentifier(expression.right) && expression.left.text === expression.right.text) {
        this.addFailureAtNode(expression, Rule.formatMessage());
      }
      if (this.isArrayWithSpreadExpressionOnly(expression.right, expression.left.text)) {
        this.addFailureAtNode(expression, Rule.formatMessage());
      }
      if (this.isArrayReverseAssignment(expression.left, expression.right)) {
        // a = a.reverse()
        this.addFailureAtNode(expression, Rule.formatMessage());
      }
    }

    super.visitBinaryExpression(expression);
  }

  private isAssignment(expression: ts.BinaryExpression) {
    return expression.operatorToken.kind === ts.SyntaxKind.EqualsToken;
  }

  private isIdentifier(expression: ts.Expression): expression is ts.Identifier {
    return expression.kind === ts.SyntaxKind.Identifier;
  }

  private isArrayWithSpreadExpressionOnly(expression: ts.Expression, variableName: string) : boolean {
    if (expression.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      return false;
    }
      
    let expressionChildNodes = expression.getChildren();
    if (expressionChildNodes.length !== 3 || expressionChildNodes[1].kind !== ts.SyntaxKind.SyntaxList) {
      return false;
    }

    let syntaxListChildNodes = expressionChildNodes[1].getChildren()
    if (syntaxListChildNodes.length !== 1) {
      return false;
    }
    
    let spread = syntaxListChildNodes[0] as SpreadElement;
    return spread && spread.expression.getText() === variableName;
  }

  private isArrayReverseAssignment(left: ts.Identifier, right: ts.Expression): boolean {
    // in case of `a = a.reverse()`, left is `a` and right is `a.reverse()`
    return (
      this.isCallExpression(right) &&
      this.isPropertyAccessExpression(right.expression) &&
      this.isIdentifier(right.expression.expression) &&
      this.isArray(right.expression.expression) &&
      right.expression.name.text === "reverse" &&
      right.expression.expression.text === left.text
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
