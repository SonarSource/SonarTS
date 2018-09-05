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
import { FunctionVisitor } from "../utils/FunctionVisitor";
import { isReturnStatement, isLiteralExpression, is } from "../utils/nodes";
import { functionLikeMainToken } from "../utils/navigation";
import areEquivalent from "../utils/areEquivalent";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-invariant-return",
    description: "Function returns should not be invariant",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3516",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Refactor this method to not always return the same value.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends FunctionVisitor {
  checkFunctionLikeDeclaration(functionNode: ts.FunctionLikeDeclaration, body: ts.Block) {
    const returnValues = this.getAllReturns(body.statements).map(
      node => (isReturnStatement(node) && node.expression ? node.expression : undefined),
    );
    const first = returnValues[0];
    if (returnValues.length > 1 && returnValues.every(value => this.areEquivalentLiteral(first, value))) {
      const issue = this.addIssue(functionLikeMainToken(functionNode), Rule.MESSAGE);
      returnValues.forEach(returnValue => {
        issue.addSecondaryLocation(returnValue!);
      });
    }
  }

  private areEquivalentLiteral(first?: ts.Expression, second?: ts.Expression) {
    if (!first || !second) {
      return false;
    }
    if (isLiteralExpression(first) || is(first, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword)) {
      return areEquivalent(first, second);
    }
    return false;
  }
}
