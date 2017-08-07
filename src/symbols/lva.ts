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
import { descendants } from "../utils/navigation";
import { SymbolTable, Usage, UsageFlag } from "./table";

export class LiveVariableAnalyzer {

  private blocksReads: Map<CfgBlock, Map<ts.Symbol, Usage>>;

  constructor(private readonly symbols: SymbolTable) {}

  public analyze(cfg: ControlFlowGraph) {
    this.blocksReads = new Map<CfgBlock, Map<ts.Symbol, Usage>>();
    const blocks = [...cfg.getBlocks(), cfg.end];
    while (blocks.length > 0) {
      const block = blocks.pop()!;
      const readsInBlock = this.analyzeBlock(block);
      this.blocksReads.set(block, readsInBlock);
      if (block instanceof CfgBlockWithPredecessors) {
        blocks.unshift(...block.predecessors);
      }
    }
  }

  private analyzeBlock(block: CfgBlock) {
    const availableReads = this.collectAvailableReads(block);
    [...block.getElements()].reverse().forEach(node => {
      descendants(node)
        .map(descendant => this.symbols.getUsage(descendant))
        .forEach(usage => {
          if (usage) {
            if (usage.is(UsageFlag.WRITE)) {
              if (availableReads.has(usage.symbol)) {
                usage.dead = false;
                availableReads.delete(usage.symbol);
              } else {
                usage.dead = true;
              }
            }
            if (usage.is(UsageFlag.READ)) {
              availableReads.set(usage.symbol, usage);
            }
          }
        });
    });
    return availableReads;
  }

  private collectAvailableReads(block: CfgBlock) {
    const availableReads = new Map<ts.Symbol, Usage>();
    block.getSuccessors().forEach(successor => {
      const availableReadsInSuccessor = this.blocksReads.get(successor);
      if (availableReadsInSuccessor) {
        availableReadsInSuccessor.forEach((usage, symbol) => availableReads.set(symbol, usage));
      }
    });
    return availableReads;
  }

}
