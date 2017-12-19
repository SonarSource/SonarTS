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
    ruleName: "no-array-delete",
    description: '"delete" should not be used on arrays',
    rationale: tslint.Utils.dedent`
      The delete operator can be used to remove a property from any object. Arrays are objects, so the delete operator
      can be used here too, but if it is, a hole will be left in the array because the indexes/keys won't be shifted to
      reflect the deletion.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2870",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = 'Remove this use of "delete".';

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public visitNode(node: ts.Node) {
    if (
      this.isDeleteExpression(node) &&
      this.isElementAccessExpression(node.expression) &&
      this.isArray(node.expression.expression)
    ) {
      this.raiseIssue(node);
    }

    super.visitNode(node);
  }

  private raiseIssue(node: ts.DeleteExpression) {
    const deleteKeyword = node.getChildren().find(child => child.kind === ts.SyntaxKind.DeleteKeyword);
    if (deleteKeyword) {
      this.addFailureAtNode(deleteKeyword, Rule.MESSAGE);
    }
  }

  private isDeleteExpression(node: ts.Node): node is ts.DeleteExpression {
    return node.kind === ts.SyntaxKind.DeleteExpression;
  }

  private isElementAccessExpression(node: ts.Node): node is ts.ElementAccessExpression {
    return node.kind === ts.SyntaxKind.ElementAccessExpression;
  }

  private isArray(node: ts.Node): boolean {
    const type = this.getTypeChecker().getTypeAtLocation(node);
    return !!type.symbol && type.symbol.name === "Array";
  }
}
