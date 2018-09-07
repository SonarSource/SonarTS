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
import { isLiteralExpression, is, isBlock } from "../utils/nodes";
import { functionLikeMainToken } from "../utils/navigation";
import areEquivalent from "../utils/areEquivalent";
import { ControlFlowGraph, CfgBlock } from "../cfg/cfg";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

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

class Visitor extends SonarRuleVisitor {
  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (node.body && isBlock(node.body)) {
      const cfg = ControlFlowGraph.fromStatements(Array.from(node.body.statements));
      if (cfg) {
        const returnedExpressions = cfg.getEndPredecessors().map(this.getExplicitReturnExpression);

        if (
          this.noImplicitReturn(returnedExpressions) &&
          returnedExpressions.length > 1 &&
          this.allSameLiteral(returnedExpressions)
        ) {
          const issue = this.addIssue(functionLikeMainToken(node), Rule.MESSAGE);
          returnedExpressions.forEach(returnedExpression => {
            issue.addSecondaryLocation(returnedExpression);
          });
        }
      }
    }

    super.visitFunctionLikeDeclaration(node);
  }

  private noImplicitReturn(returnedExpressions: (ts.Expression | undefined)[]): returnedExpressions is ts.Expression[] {
    return returnedExpressions.every(expr => !!expr);
  }

  private allSameLiteral(returnedExpressions: ts.Expression[]) {
    const first = returnedExpressions[0];
    if (isLiteralExpression(first) || is(first, ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword)) {
      return returnedExpressions.every(expression => areEquivalent(first, expression));
    }
    return false;
  }

  private getExplicitReturnExpression(cfgBlock: CfgBlock): ts.Expression | undefined {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    if (!lastElement) {
      return undefined;
    }

    if (lastElement && lastElement.kind === ts.SyntaxKind.ReturnStatement) {
      return (lastElement as ts.ReturnStatement).expression;
    }
  }
}
