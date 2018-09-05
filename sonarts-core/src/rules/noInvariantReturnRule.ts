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
import { isReturnStatement, isLiteralExpression } from "../utils/nodes";
import { functionLikeMainToken } from "../utils/navigation";

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

  public static MESSAGE = "TODO: add message";

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
    if (
      first &&
      isLiteralExpression(first) &&
      returnValues.length > 1 &&
      returnValues.every(value => !!value && isLiteralExpression(value) && value.getText() === first.getText())
    ) {
      const issue = this.addIssue(functionLikeMainToken(functionNode), Rule.MESSAGE);
      returnValues.forEach(returnValue => {
        issue.addSecondaryLocation(returnValue!);
      });
    }
  }
}
