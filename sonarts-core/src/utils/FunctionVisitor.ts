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
  public visitFunctionDeclaration(func: ts.FunctionDeclaration) {
    if (!func.body) return;
    this.checkFunctionLikeDeclaration(func, func.body, func.type);
  }

  public visitMethodDeclaration(meth: ts.MethodDeclaration) {
    if (!meth.body) return;
    this.checkFunctionLikeDeclaration(meth, meth.body, meth.type);
  }

  public visitGetAccessor(accessor: ts.AccessorDeclaration) {
    if (!accessor.body) return;
    this.checkFunctionLikeDeclaration(accessor, accessor.body, accessor.type);
  }

  public visitArrowFunction(func: ts.ArrowFunction) {
    if (func.body.kind === ts.SyntaxKind.Block) {
      this.checkFunctionLikeDeclaration(func, func.body as ts.Block, func.type);
    }
  }

  public getAllReturns(statements: ts.NodeArray<ts.Statement>) {
    const cfg = ControlFlowGraph.fromStatements(Array.from(statements));
    if (cfg) {
      const predecessors = cfg.end.predecessors.filter(
        block => block === cfg.start || this.blockHasPredecessors(block),
      );
      return predecessors.reduce(this.getReturn, []);
    } else {
      return [];
    }
  }

  private getReturn(nodes: ts.Node[], cfgBlock: CfgBlock) {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    return lastElement && !is(lastElement, ts.SyntaxKind.ThrowStatement) ? nodes.concat(lastElement) : nodes;
  }

  private blockHasPredecessors(cfgBlock: any): boolean {
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
