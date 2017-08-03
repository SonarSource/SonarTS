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

it("variable declarations", () => {
  const {symbols, sourceFile} = buildSymbolTable();
  expect(symbols.getUsage(getIdentifier(sourceFile, "local")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getIdentifier(sourceFile, "variable")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getIdentifier(sourceFile, "constant")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getIdentifier(sourceFile, "parameter")).flags).toBe(UsageFlag.DECLARATION);
});

it("writes", () => {
  const {symbols, sourceFile} = buildSymbolTable();
  expect(symbols.getUsage(getIdentifier(sourceFile, "local", 4)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getIdentifier(sourceFile, "decAndInit")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getIdentifier(sourceFile, "pWithDefault")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
});

it("reads", () => {
  const {symbols, sourceFile} = buildSymbolTable();
  expect(symbols.getUsage(getIdentifier(sourceFile, "read", 10)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getIdentifier(sourceFile, "read", 12)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getIdentifier(sourceFile, "read", 14)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getIdentifier(sourceFile, "read", 15)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getIdentifier(sourceFile, "read", 17)).flags).toBe(UsageFlag.READ);
});

it("identify read-writes", () => {

});

function getIdentifier(sourceFile: ts.SourceFile, identifierText: string, line?: number): ts.Identifier | undefined {
  const identifiers = descendants(sourceFile)
    .filter(node => is(node, ts.SyntaxKind.Identifier))
    .map(node => node as ts.Identifier)
    .filter(node => node.getText() === identifierText);
  if (line) {
    return identifiers.find(node => sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line === line - 1);
  } else {
    return identifiers[0];
  }
}

function buildSymbolTable(): {symbols: SymbolTable, sourceFile: ts.SourceFile} {
  const { sourceFile, program } = parseFile(path.join(__dirname, "sample_symbols.ts"));
  const symbols = SymbolTableBuilder.build(sourceFile, program);
  return { symbols, sourceFile };
}
