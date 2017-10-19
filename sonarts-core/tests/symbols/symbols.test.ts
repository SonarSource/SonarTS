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
import { SymbolTable, UsageFlag } from "../../src/symbols/table";
import { buildSymbolTable, getNode } from "./test_utils";

const { symbols, sourceFile } = buildSymbolTable("sample_symbols.lint.ts");

it("variable declarations", () => {
  expect(symbols.getUsage(getNode(sourceFile, "local")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "variable")).flags).toBe(UsageFlag.DECLARATION);
});

it("other declarations", () => {
  expect(symbols.getUsage(getNode(sourceFile, "foo")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Foo")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Enum")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "imported1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "imported2")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "importedNS")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Module")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "StringLiteralModule")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "varEl1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Interface")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "importEquals")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "propertyDeclaration")).flags).toBe(UsageFlag.DECLARATION);
  /*
    Maybe implement some day :
    TypeAliasDeclaration
    IndexSignatureDeclaration
    MethodDeclaration
    ConstructorDeclaration
  */
});

it("writes", () => {
  expect(symbols.getUsage(getNode(sourceFile, "local", 19)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "variable", 27)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "constant")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "decAndInit")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "pWithDefault")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "parameter")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "read", 23)).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "varEl2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "dstruct1")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "dstruct2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "arrDStruct1")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "arrDStruct2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "_")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);

  expect(symbols.getUsage(getNode(sourceFile, "a", 74)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "b", 74)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "d", 74)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "e", 74)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rest", 74)).flags).toBe(UsageFlag.WRITE);

  expect(symbols.getUsage(getNode(sourceFile, "a", 76)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "b", 76)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "d", 76)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rest", 76)).flags).toBe(UsageFlag.WRITE);
});

it("reads", () => {
  expect(symbols.getUsage(getNode(sourceFile, "read", 27)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 29)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 31)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 32)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 35)).flags).toBe(UsageFlag.READ);
  // read usage is not there. This case will be specifically considered in LVA
  expect(symbols.getUsage(getNode(sourceFile, "exported")).flags).toBe(UsageFlag.WRITE | UsageFlag.DECLARATION);

  // there are symbols for properties in symbol table, while the usages kind might be not correct
  expect(symbols.getUsage(getNode(sourceFile, "prop", 70)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "prop", 71)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "a", 78)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "b", 78)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "c", 75)).flags).toBe(UsageFlag.READ);
});

it("read-writes", () => {
  expect(symbols.getUsage(getNode(sourceFile, "rw", 62)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 63)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 64)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 65)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 66)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 67)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "propertyDeclarationInConstructor")).flags).toBe(
    UsageFlag.DECLARATION | UsageFlag.WRITE,
  );
});

it("same symbol for shorthand property", () => {
  const declSymbol = symbols.getUsage(getNode(sourceFile, "x", 81)).symbol;
  const usageSymbol = symbols.getUsage(getNode(sourceFile, "x", 82)).symbol;
  expect(declSymbol === usageSymbol).toBe(true);
});
