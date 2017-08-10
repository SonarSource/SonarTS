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
import * as path from "path";
import * as ts from "typescript";
import { SymbolTableBuilder } from "../../src/symbols/builder";
import { SymbolTable, UsageFlag } from "../../src/symbols/table";
import { descendants, is } from "../../src/utils/navigation";
import { parseFile } from "../../src/utils/parser";

export function getNode(root: ts.Node, identifierText: string, line?: number): ts.Node | undefined {
  const identifiers = descendants(root)
    .filter(node => is(node, ts.SyntaxKind.Identifier, ts.SyntaxKind.StringLiteral))
    .filter(node => node.getText().match(".?" + identifierText + ".?"));
  if (line) {
    return identifiers.find(
      identifier => identifier.getSourceFile().getLineAndCharacterOfPosition(identifier.getEnd()).line === line - 1,
    );
  } else {
    return identifiers[0];
  }
}

export function buildSymbolTable(fileName: string): { symbols: SymbolTable; sourceFile: ts.SourceFile } {
  const { sourceFile, program } = parseFile(path.join(__dirname, fileName));
  const symbols = SymbolTableBuilder.build(sourceFile, program);
  return { symbols, sourceFile };
}
