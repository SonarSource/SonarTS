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
import { ancestorsChain } from "../utils/navigation";

export class SymbolTable {
  private usages = new Map<ts.Node, Usage>();
  private usagesBySymbol = new Map<ts.Symbol, Usage[]>();

  public registerUsageIfMissing(symbol: ts.Symbol, node: ts.Node, flags: UsageFlag): void {
    // if this node is "write" usage, "Usage" instance was created before and we do nothing
    if (this.usages.has(node)) return;

    const usage = new Usage(symbol, flags, node);
    this.usages.set(node, usage);
    if (!this.usagesBySymbol.has(symbol)) this.usagesBySymbol.set(symbol, []);
    this.usagesBySymbol.get(symbol)!.push(usage);
  }

  public getUsage(node: ts.Node): Usage | undefined {
    return this.usages.get(node);
  }

  public allUsages(symbol: ts.Symbol): Usage[] {
    return this.usagesBySymbol.has(symbol) ? this.usagesBySymbol.get(symbol)! : [];
  }

  public getSymbols(): ts.Symbol[] {
    return Array.from(this.usagesBySymbol.keys());
  }
}

export class Usage {
  public dead = false;

  constructor(public readonly symbol: ts.Symbol, public readonly flags: UsageFlag, public readonly node: ts.Node) {}

  public is(requestedFlags: UsageFlag) {
    return (this.flags & requestedFlags) > 0;
  }

  public flagsAsString() {
    let result = "";
    if (this.is(UsageFlag.DECLARATION)) result += "d";
    if (this.is(UsageFlag.WRITE)) result += "w";
    if (this.is(UsageFlag.READ)) result += "r";
    return result;
  }

  public isUsedInside(node: ts.Node) {
    return ancestorsChain(this.node, ts.SyntaxKind.SourceFile).includes(node);
  }
}

export enum UsageFlag {
  DECLARATION = 1,
  WRITE = 2,
  READ = 4,
}
