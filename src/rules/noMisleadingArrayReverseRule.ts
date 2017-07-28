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

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-misleading-array-reverse",
    description: '"Array.reverse" should not be used misleadingly',
    rationale: tslint.Utils.dedent`
      Many of JavaScript's Array methods return an altered version of the array while leaving the source array intact.
      Array.reverse() is not one of those. Instead, it alters the source array in addition to returning the altered
      version.
      To make sure maintainers are explicitly aware of this change to the original array, calls to reverse() should be
      standalone statements or preceded by a call that duplicates the original array.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4043",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = 'Move this array "reverse" operation to a separate statement.';

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public visitCallExpression(callExpression: ts.CallExpression) {
    // first, take all call expressions: `foo()`

    // then check that:
    // * callee is a property access expression
    // * left part of callee is array
    // * the property name is "reverse": `foo.reverse()`
    if (
      this.isPropertyAccessExpression(callExpression.expression) &&
      this.isArray(callExpression.expression.expression) &&
      callExpression.expression.name.text === "reverse"
    ) {
      // store `foo` from `foo.reverse()`, or `foo.bar` from `foo.bar.reverse()`, etc
      const reversedArray = callExpression.expression.expression;

      if (
        // check that the left part of the property access expression is:
        // * identifier: `foo.reverse()`
        // * another property access expression: `foo.bar.reverse()`
        this.isIdentifierOrPropertyAccessExpression(reversedArray) &&
        // exlude case `a = a.reverse()`
        !this.isReverseInSelfAssignment(reversedArray, callExpression.parent) &&
        // check if we face one of the forbidden usages
        this.isForbiddenOperation(callExpression)
      ) {
        this.addFailureAtNode(callExpression, Rule.MESSAGE);
      }
    }

    super.visitCallExpression(callExpression);
  }

  private isPropertyAccessExpression(node: ts.Node): node is ts.PropertyAccessExpression {
    return node.kind === ts.SyntaxKind.PropertyAccessExpression;
  }

  private isArray(node: ts.Node): boolean {
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return !!type.symbol && type.symbol.name === "Array";
  }

  private isIdentifier(node: ts.Node): node is ts.Identifier {
    return node.kind === ts.SyntaxKind.Identifier;
  }

  private isGetAccessor(node: ts.Node): boolean {
    const { declarations } = this.getTypeChecker().getSymbolAtLocation(node);
    return declarations != null && declarations.length === 1 && declarations[0].kind === ts.SyntaxKind.GetAccessor;
  }

  private isIdentifierOrPropertyAccessExpression(node: ts.Node): boolean {
    // exclude class getters from consideration
    return this.isIdentifier(node) || (this.isPropertyAccessExpression(node) && !this.isGetAccessor(node));
  }

  private isForbiddenOperation(node: ts.Node): boolean {
    return (
      // const a = b.reverse()
      this.isForbiddenVariableDeclaration(node) ||
      // a = b.reverse();
      this.isForbiddenBinaryExpression(node) ||
      // foo(b.reverse())
      this.isForbiddenCallExpression(node) ||
      // foo(b => b.reverse())
      this.isForbiddenArrowFunction(node)
    );
  }

  private isForbiddenVariableDeclaration(node: ts.Node): boolean {
    return node.parent != null && node.parent.kind === ts.SyntaxKind.VariableDeclaration;
  }

  private isForbiddenBinaryExpression(node: ts.Node): boolean {
    return node.parent != null && this.isBinaryExpression(node.parent);
  }

  private isForbiddenCallExpression(node: ts.Node): boolean {
    const { parent } = node;
    return (
      parent != null &&
      parent.kind === ts.SyntaxKind.CallExpression &&
      (parent as ts.CallExpression).arguments.some(argument => argument === node)
    );
  }

  private isForbiddenArrowFunction(node: ts.Node): boolean {
    const { parent } = node;
    return parent != null && parent.kind === ts.SyntaxKind.ArrowFunction && (parent as ts.ArrowFunction).body === node;
  }

  private isBinaryExpression(node?: ts.Node): node is ts.BinaryExpression {
    return node != null && node.kind === ts.SyntaxKind.BinaryExpression;
  }

  private isReverseInSelfAssignment(reversedArray: ts.Expression, node?: ts.Node): boolean {
    return (
      // check assignment
      this.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      // check that identifiers on both sides are the same
      this.isIdentifier(node.left) &&
      this.isIdentifier(reversedArray) &&
      node.left.text === reversedArray.text
    );
  }
}
