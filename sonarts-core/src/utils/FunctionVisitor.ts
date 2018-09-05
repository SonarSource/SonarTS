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

import * as ts from "typescript";
import { SonarRuleVisitor } from "./sonarAnalysis";
import { CfgBlock, ControlFlowGraph } from "../cfg/cfg";
import { is } from "./nodes";

export abstract class FunctionVisitor extends SonarRuleVisitor {
  public visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    if (!node.body) return;
    this.checkFunctionLikeDeclaration(node, node.body as ts.Block, node.type);
  }

  public getAllReturns(statements: ts.NodeArray<ts.Statement>) {
    const cfg = ControlFlowGraph.fromStatements(Array.from(statements));
    if (cfg) {
      const predecessors = cfg.end.predecessors.filter(
        block => block === cfg.start || this.blockHasPredecessors(block),
      );
      let returnNodes: ts.Node[] = [];
      predecessors.forEach(cfgBlock => {
        const returnNode = this.getReturn(cfgBlock);
        if (returnNode) {
          returnNodes.push();
        }
      });
      return returnNodes;
    } else {
      return [];
    }
  }

  private getReturn(cfgBlock: CfgBlock) {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    if (lastElement && !is(lastElement, ts.SyntaxKind.ThrowStatement)) {
      return lastElement;
    }
  }

  private blockHasPredecessors(cfgBlock: CfgBlock): boolean {
    if (cfgBlock.predecessors) {
      return cfgBlock.predecessors.length > 0;
    }
    return false;
  }

  public abstract checkFunctionLikeDeclaration(
    functionNode: ts.FunctionLikeDeclaration,
    body: ts.Block,
    returnType?: ts.TypeNode,
  ): void;
}
