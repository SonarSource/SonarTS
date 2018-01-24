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
import { firstLocalAncestor } from "../utils/navigation";
import { isArray, ARRAY_MUTATING_CALLS } from "../utils/semantics";
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { isPropertyAccessExpression, isIdentifier, isBinaryExpression } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-misleading-array-reverse",
    description: "Array-mutating methods should not be used misleadingly",
    rationale: tslint.Utils.dedent`
      Many of JavaScript's Array methods return an altered version of the array while leaving the source array intact.
      reverse and sort are not one of these. Instead, they alter the source array in addition to returning the altered version, which is likely not what was intended.
      To make sure maintainers are explicitly aware of this change to the original array, calls to reverse() should be
      standalone statements or preceded by a call that duplicates the original array.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4043",
    type: "functionality",
    typescriptOnly: false,
  };

  public static getMessage(methodName: string): string {
    return `Move this array "${methodName}" operation to a separate statement.`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  public visitCallExpression(callExpression: ts.CallExpression) {
    // first, take all call expressions: `foo()`

    // then check that:
    // * callee is a property access expression
    // * left part of callee is array
    // * the property is mutating, e.g."reverse" or "sort": `foo.reverse()`
    if (isPropertyAccessExpression(callExpression.expression) && this.isArrayMutatingCall(callExpression.expression)) {
      // store `foo` from `foo.reverse()`, `foo.sort()`, or `foo.bar` from `foo.bar.reverse()`, etc
      const mutatedArray = callExpression.expression.expression;

      if (
        // check that the left part of the property access expression is:
        // * identifier: `foo.reverse()`
        // * another property access expression: `foo.bar.reverse()`
        this.isIdentifierOrPropertyAccessExpression(mutatedArray) &&
        // exlude case `a = a.reverse()`
        !this.isReverseInSelfAssignment(mutatedArray, callExpression.parent) &&
        // check if we face one of the forbidden usages
        this.isForbiddenOperation(callExpression)
      ) {
        this.addIssue(callExpression, Rule.getMessage(callExpression.expression.name.text));
      }
    }

    super.visitCallExpression(callExpression);
  }

  private isArrayMutatingCall(expression: ts.PropertyAccessExpression): boolean {
    return (
      isArray(expression.expression, this.program.getTypeChecker()) &&
      ARRAY_MUTATING_CALLS.includes(expression.name.text)
    );
  }

  private isGetAccessor(node: ts.Node): boolean {
    const symbol = this.program.getTypeChecker().getSymbolAtLocation(node);
    const declarations = symbol && symbol.declarations;
    return (
      declarations !== undefined && declarations.length === 1 && declarations[0].kind === ts.SyntaxKind.GetAccessor
    );
  }

  private isIdentifierOrPropertyAccessExpression(node: ts.Node): boolean {
    // exclude class getters from consideration
    return isIdentifier(node) || (isPropertyAccessExpression(node) && !this.isGetAccessor(node));
  }

  private isForbiddenOperation(node: ts.Node): boolean {
    const { parent } = node;
    return (
      parent != null &&
      parent.kind !== ts.SyntaxKind.ExpressionStatement &&
      !firstLocalAncestor(node, ts.SyntaxKind.ReturnStatement)
    );
  }

  private isReverseInSelfAssignment(reversedArray: ts.Expression, node?: ts.Node): boolean {
    return (
      // check assignment
      node !== undefined &&
      isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      // check that identifiers on both sides are the same
      isIdentifier(node.left) &&
      isIdentifier(reversedArray) &&
      node.left.text === reversedArray.text
    );
  }
}
