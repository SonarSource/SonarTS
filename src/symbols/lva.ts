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
import * as ts from "typescript";
import { CfgBlock, CfgBlockWithPredecessors, ControlFlowGraph } from "../cfg/cfg";
import { firstLocalAncestor, FUNCTION_LIKE, getIdentifier, is, isAssignment } from "../utils/navigation";
import { SymbolTable, UsageFlag } from "./table";

export class LiveVariableAnalyzer {
  private liveIn: Map<CfgBlock, Set<ts.Symbol>>;
  private root: ts.FunctionLikeDeclaration;

  constructor(private readonly symbols: SymbolTable) {}

  public analyze(root: ts.FunctionLikeDeclaration) {
    if (!is(root.body, ts.SyntaxKind.Block)) {
      return;
    }
    const cfg = ControlFlowGraph.fromStatements((root.body as ts.Block).statements);
    if (!cfg) return;
    this.root = root;
    // symbols which value will be read after entering this block (aka live symbols)
    this.liveIn = new Map<CfgBlock, Set<ts.Symbol>>();
    const blocks = cfg.getBlocks().concat(cfg.end);
    while (blocks.length > 0) {
      const block = blocks.pop()!;
      // live-in symbols from previous iteration of the algorithm for this block
      const oldLive = this.liveIn.get(block);
      const newLive = this.computeSymbolsWithAvailableReads(block);
      if (!this.same(newLive, oldLive)) {
        if (block instanceof CfgBlockWithPredecessors) {
          blocks.unshift(...block.predecessors);
        }
      }
      this.liveIn.set(block, newLive);
    }
  }

  private computeSymbolsWithAvailableReads(block: CfgBlock): Set<ts.Symbol> {
    const availableReads = this.successorSymbolsWithAvailableReads(block);
    [...block.getElements()].reverse().forEach(element => {
      const usage = this.symbols.getUsage(usageNode(element));
      if (usage && !this.isUsedInNestedFunctions(usage.symbol)) {
        if (usage.is(UsageFlag.WRITE)) {
          if (availableReads.has(usage.symbol)) {
            usage.dead = false;
            availableReads.delete(usage.symbol);
          } else {
            usage.dead = true;
          }
        }
        if (usage.is(UsageFlag.READ)) {
          availableReads.add(usage.symbol);
        }
      }
    });
    return availableReads;

    function usageNode(node: ts.Node): ts.Node | ts.Identifier {
      if (isAssignment(node)) {
        const identifier = getIdentifier(node.left);
        if (identifier) return identifier;
      }
      return node;
    }
  }

  private isUsedInNestedFunctions(symbol: ts.Symbol): boolean {
    return this.symbols
      .allUsages(symbol)
      .some(usage => firstLocalAncestor(usage.node, ...FUNCTION_LIKE) !== this.root);
  }

  private successorSymbolsWithAvailableReads(block: CfgBlock): Set<ts.Symbol> {
    const availableReads = new Set<ts.Symbol>();
    block.getSuccessors().forEach(successor => {
      const availableReadsInSuccessor = this.liveIn.get(successor);
      if (availableReadsInSuccessor) {
        availableReadsInSuccessor.forEach(symbol => availableReads.add(symbol));
      }
    });
    return availableReads;
  }

  private same(newLive: Set<ts.Symbol>, oldLive?: Set<ts.Symbol>) {
    if (!oldLive) return false;
    if (oldLive.size !== newLive.size) return false;
    for (const symbol of newLive) {
      if (!oldLive.has(symbol)) {
        return false;
      }
    }
    return true;
  }
}
