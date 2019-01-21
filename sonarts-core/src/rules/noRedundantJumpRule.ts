/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { ControlFlowGraph } from "../cfg/cfg";
import { is, isContinueStatement, isReturnStatement } from "../utils/nodes";
import { firstLocalAncestor } from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-redundant-jump",
    description: "Jump statements should not be redundant",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3626",
    type: "functionality",
    typescriptOnly: false,
  };

  public static MESSAGE = "Remove this redundant jump.";

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitFunctionDeclaration(func: ts.FunctionDeclaration) {
    if (!func.body) return;
    const cfg = ControlFlowGraph.fromStatements(Array.from(func.body.statements));
    if (cfg) {
      for (const block of cfg.getBlocks()) {
        const successors = block.getSuccessors();
        const lastElement = block.getElements()[block.getElements().length - 1];
        if (
          successors.length === 1 &&
          successors[0] === block.successorWithoutJump &&
          !isReturnWithExpression(lastElement) &&
          !isInSwitch(lastElement) &&
          !isContinueWithLabel(lastElement)
        ) {
          this.addIssue(lastElement, Rule.MESSAGE);
        }
      }
    }
  }
}

function isReturnWithExpression(node: ts.Node): boolean {
  return isReturnStatement(node) && !!node.expression;
}

function isInSwitch(node: ts.Node): boolean {
  const LOOPS = [
    ts.SyntaxKind.ForStatement,
    ts.SyntaxKind.WhileStatement,
    ts.SyntaxKind.DoStatement,
    ts.SyntaxKind.ForOfStatement,
    ts.SyntaxKind.ForInStatement,
  ];
  const localAncestor = firstLocalAncestor(node, ts.SyntaxKind.SwitchStatement, ...LOOPS);
  return is(localAncestor, ts.SyntaxKind.SwitchStatement);
}

function isContinueWithLabel(node: ts.Node): boolean {
  return isContinueStatement(node) && !!node.label;
}
