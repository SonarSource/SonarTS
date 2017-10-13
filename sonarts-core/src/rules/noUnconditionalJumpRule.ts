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
import { CfgBlock, CfgBlockWithPredecessors, ControlFlowGraph } from "../cfg/cfg";
import { SonarRuleMetaData } from "../sonarRule";
import * as nav from "../utils/navigation";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    description: "Jump statements should not be used unconditionally",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-1751",
    ruleName: "no-unconditional-jump",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

class Walker extends tslint.RuleWalker {
  public visitBreakStatement(node: ts.BreakOrContinueStatement): void {
    this.checkJump(node);
  }

  public visitContinueStatement(node: ts.BreakOrContinueStatement) {
    this.checkJump(node);
  }

  public visitThrowStatement(node: ts.ThrowStatement) {
    this.checkJump(node);
  }

  public visitReturnStatement(node: ts.ReturnStatement) {
    this.checkJump(node);
  }

  private checkJump(node: ts.BreakOrContinueStatement | ts.ThrowStatement | ts.ReturnStatement) {
    if (this.isConditional(node)) return;
    if (node.kind === ts.SyntaxKind.BreakStatement && this.isInsideForIn(node)) return;
    if (node.kind === ts.SyntaxKind.ReturnStatement && this.isInsideForOf(node)) return;
    const cfg = this.buildCfg(node);
    if (!cfg) return;
    const keyword = nav.keyword(node);
    const loop = nav.firstLocalAncestor(node, ...nav.LOOP_STATEMENTS);
    if (!loop) return;
    if (node.kind === ts.SyntaxKind.ContinueStatement) {
      this.raiseIssue(keyword);
    } else {
      const loopingBlock = cfg.findLoopingBlock(loop);
      if (loopingBlock && this.actuallyLoops(loopingBlock)) return;
      this.raiseIssue(keyword);
    }
  }

  private raiseIssue(keyword: ts.Node) {
    this.addFailureAtNode(keyword, `Remove this "${keyword.getText()}" statement or make it conditional`);
  }

  private isConditional(node: ts.Node): boolean {
    const parents = nav.localAncestorsChain(node).map(p => p.kind);
    const conditionalsAndLoops = parents.filter(kind =>
      nav.LOOP_STATEMENTS.concat(nav.CONDITIONAL_STATEMENTS).includes(kind),
    );
    return conditionalsAndLoops.length > 0 && nav.CONDITIONAL_STATEMENTS.includes(conditionalsAndLoops[0]);
  }

  private isInsideForIn(node: ts.BreakStatement): boolean {
    const parentLoop = nav.firstLocalAncestor(node, ...nav.LOOP_STATEMENTS);
    return !!parentLoop && parentLoop.kind === ts.SyntaxKind.ForInStatement;
  }

  private isInsideForOf(node: ts.ReturnStatement): boolean {
    const parentLoop = nav.firstLocalAncestor(node, ...nav.LOOP_STATEMENTS);
    return !!parentLoop && parentLoop.kind === ts.SyntaxKind.ForOfStatement;
  }

  private buildCfg(node: ts.Node): ControlFlowGraph | void {
    const wrappingFunction = nav.firstLocalAncestor(node, ...nav.FUNCTION_LIKE) as
      | ts.FunctionLikeDeclaration
      | undefined;
    if (wrappingFunction && wrappingFunction.body) {
      if (wrappingFunction.body.kind === ts.SyntaxKind.Block) {
        return ControlFlowGraph.fromStatements((wrappingFunction.body as ts.Block).statements);
      } else {
        return; // When moving buildCfg to cfg file this should be replaced by fromExpression, here instead, we skip
      }
    }
    return ControlFlowGraph.fromStatements(node.getSourceFile().statements);
  }

  private actuallyLoops(block: CfgBlock): boolean {
    if (!block.loopingStatement) return false;
    const loopContents = this.collectLoopContents(block.loopingStatement);
    if (block instanceof CfgBlockWithPredecessors) {
      return !!block.predecessors.find(
        predecessor =>
          this.hasPredecessor(predecessor) &&
          !!predecessor.getElements().find(predecessorElement => loopContents.includes(predecessorElement)),
      );
    } else {
      return false;
    }
  }

  private collectLoopContents(iterationStatement: ts.IterationStatement): ts.Node[] {
    const bodyContents = nav.descendants(iterationStatement.statement);
    if (iterationStatement.kind === ts.SyntaxKind.ForStatement) {
      const updateExpression = (iterationStatement as ts.ForStatement).incrementor;
      if (updateExpression) return bodyContents.concat(nav.descendants(updateExpression));
    }
    return bodyContents;
  }

  private hasPredecessor(block: CfgBlock): boolean {
    if (block instanceof CfgBlockWithPredecessors) {
      return block.predecessors.length > 0;
    } else {
      return false;
    }
  }
}
