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
import { SymbolTable, UsageFlag } from "./table";

export class SymbolTableBuilder extends tslint.SyntaxWalker {
  private table = new SymbolTable();

  public static build(sourceFile: ts.SourceFile, program: ts.Program): SymbolTable {
    const builder = new SymbolTableBuilder(program);
    builder.walk(sourceFile);
    return builder.table;
  }

  private constructor(private program: ts.Program) {
    super();
  }

  protected visitBinaryExpression(exp: ts.BinaryExpression): void {
    if (exp.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      this.registerUsage(exp.left, UsageFlag.WRITE);
    }
  }

  protected visitIdentifier(node: ts.Identifier): void {
    this.registerUsage(node, UsageFlag.DECLARATION);
  }

  private registerUsage(node: ts.Node, flags: UsageFlag) {
    this.symbol(node, symbol => this.table.registerUsage(symbol, node, flags));
  }

  private symbol(node: ts.Node, operationWithSymbol: (symbol: ts.Symbol) => void = () => {}): ts.Symbol | undefined {
    const symbol = this.program.getTypeChecker().getSymbolAtLocation(node);
    if (symbol) operationWithSymbol(symbol);
    return symbol;
  }

}
