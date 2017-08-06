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
import { ControlFlowGraph } from "../cfg/cfg";
import { descendants } from "../utils/navigation";
import * as ts from "typescript";
import { SymbolTable, Usage, UsageFlag } from "./table";

export class LiveVariableAnalyzer {
  constructor(private readonly symbols: SymbolTable) {}

  public analyze(cfg: ControlFlowGraph) {
    const availableReads = new Map<ts.Symbol, Usage>();
    const block = cfg.end.predecessors[0];
    [...block.getElements()].reverse().forEach(node => {
      console.log(node.getText());
      descendants(node)
        .map(descendant => this.symbols.getUsage(descendant))
        .forEach(usage => {
          if (usage) {
            //console.log(usage);
            if (usage.is(UsageFlag.WRITE)) {

              if (availableReads.has(usage.symbol)) {
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
  }
}
