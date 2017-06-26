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
import * as Lint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends Lint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Collection sizes and array length comparisons should make sense",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-3981",
    ruleName: "no-collection-size-mischeck",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends Lint.ProgramAwareRuleWalker {
  private static readonly COLLECTION_TYPES = ["Array", "Map", "Set"];

  private static message(collection: string, property: string) {
    return `The ${property} of "${collection}" is always ">=0", so fix this test to get the real expected behavior.`;
  }

  public visitBinaryExpression(node: ts.BinaryExpression) {
    if (
      node.operatorToken.kind === ts.SyntaxKind.GreaterThanEqualsToken ||
      node.operatorToken.kind === ts.SyntaxKind.LessThanToken
    ) {
      if (node.right.getText() === "0" && node.left.kind === ts.SyntaxKind.PropertyAccessExpression) {
        const object = (node.left as ts.PropertyAccessExpression).expression;
        const property = (node.left as ts.PropertyAccessExpression).name.text;

        if ((property === "length" || property === "size") && this.isCollection(object)) {
          this.addFailureAtNode(node, Walker.message(object.getText(), property));
        }
      }
    }

    super.visitBinaryExpression(node);
  }

  private isCollection(object: ts.Node): boolean {
    const type = this.getTypeChecker().getTypeAtLocation(object);
    return !!type.symbol && Walker.COLLECTION_TYPES.includes(type.symbol.name);
  }
}
