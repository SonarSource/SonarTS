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
import {
  collectLeftHandIdentifiers,
  firstLocalAncestor,
  FUNCTION_LIKE,
  is,
  isAssignment,
  firstAncestor,
} from "../utils/navigation";
import { SymbolTable, Usage, UsageFlag } from "./table";

export class LiveVariableAnalyzer {
  private blockAvailableReads: Map<CfgBlock, Set<ts.Symbol>>;
  private root: ts.FunctionLikeDeclaration | ts.SourceFile;
  private static readonly FUNCTION_OR_SOURCE_FILE = [...FUNCTION_LIKE, ts.SyntaxKind.SourceFile];

  constructor(private readonly symbols: SymbolTable) {}

  public analyzeFunction(root: ts.FunctionLikeDeclaration): LVAReturn | undefined {
    if (!is(root.body, ts.SyntaxKind.Block)) {
      return;
    }
    return this.analyze(root, (root.body as ts.Block).statements);
  }

  public analyze(root: ts.Node, statements: ts.Statement[]): LVAReturn | undefined {
    const cfg = ControlFlowGraph.fromStatements(statements);
    if (!cfg) return;
    this.root = (is(root, ...FUNCTION_LIKE) ? root : firstAncestor(root, LiveVariableAnalyzer.FUNCTION_OR_SOURCE_FILE)) as
      | ts.FunctionLikeDeclaration
      | ts.SourceFile;
    // symbols whose value will be read after entering a block (aka live symbols)
    this.blockAvailableReads = new Map<CfgBlock, Set<ts.Symbol>>();
    const blocks = cfg.getBlocks().concat(cfg.end);
    while (blocks.length > 0) {
      const block = blocks.pop()!;
      // live-in symbols from previous iteration of the algorithm for this block
      const oldBlockReads = this.blockAvailableReads.get(block);
      const newBlockReads = this.computeSymbolsWithAvailableReads(block);
      if (!this.same(newBlockReads, oldBlockReads)) {
        if (block instanceof CfgBlockWithPredecessors) {
          blocks.unshift(...block.predecessors);
        }
      }
      this.blockAvailableReads.set(block, newBlockReads);
    }

    return { cfg, blockAvailableReads: this.blockAvailableReads };
  }

  private computeSymbolsWithAvailableReads(block: CfgBlock): Set<ts.Symbol> {
    const availableReads = this.successorSymbolsWithAvailableReads(block);
    [...block.getElements()].reverse().forEach(element => {
      if (isAssignment(element)) {
        collectLeftHandIdentifiers((element as ts.BinaryExpression).left).identifiers.forEach(identifier => {
          this.trackUsage(this.symbols.getUsage(identifier), availableReads);
        });
      } else {
        this.trackUsage(this.symbols.getUsage(element), availableReads);
      }
    });
    return availableReads;
  }

  private trackUsage(usage: Usage | undefined, availableReads: Set<ts.Symbol>) {
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
  }

  private isUsedInNestedFunctions(symbol: ts.Symbol): boolean {
    return this.symbols
      .allUsages(symbol)
      .some(usage => firstLocalAncestor(usage.node, ...LiveVariableAnalyzer.FUNCTION_OR_SOURCE_FILE) !== this.root);
  }

  private successorSymbolsWithAvailableReads(block: CfgBlock): Set<ts.Symbol> {
    const availableReads = new Set<ts.Symbol>();
    block.getSuccessors().forEach(successor => {
      const availableReadsInSuccessor = this.blockAvailableReads.get(successor);
      if (availableReadsInSuccessor) {
        availableReadsInSuccessor.forEach(symbol => availableReads.add(symbol));
      }
    });
    return availableReads;
  }

  private same(newAvailableReads: Set<ts.Symbol>, oldAvailableReads?: Set<ts.Symbol>) {
    if (!oldAvailableReads) return false;
    if (oldAvailableReads.size !== newAvailableReads.size) return false;
    for (const symbol of newAvailableReads) {
      if (!oldAvailableReads.has(symbol)) {
        return false;
      }
    }
    return true;
  }
}

export type LVAReturn = { cfg: ControlFlowGraph; blockAvailableReads: Map<CfgBlock, Set<ts.Symbol>> };
