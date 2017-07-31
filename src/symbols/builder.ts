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
import { SymbolTable } from "./symbolTable";

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

  protected visitIdentifier(node: ts.Identifier): void {
    const symbol = this.program.getTypeChecker().getSymbolAtLocation(node);
    if (symbol) {
      this.table.registerUsage(symbol, node);
    }
  }
}
