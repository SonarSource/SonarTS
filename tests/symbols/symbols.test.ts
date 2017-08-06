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

const { symbols, sourceFile } = buildSymbolTable("sample_symbols.ts");

it("variable declarations", () => {
  expect(symbols.getUsage(getNode(sourceFile, "local")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "variable")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "constant")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "parameter")).flags).toBe(UsageFlag.DECLARATION);
});

it("other declarations", () => {
  expect(symbols.getUsage(getNode(sourceFile, "foo")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Foo")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Enum")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "imported1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "imported2")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "importedNS")).flags).toBe(UsageFlag.DECLARATION);
  // Are there more variants of module declaration and imports?
  expect(symbols.getUsage(getNode(sourceFile, "Module")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "StringLiteralModule")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "varEl1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "Interface")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "importEquals")).flags).toBe(UsageFlag.DECLARATION);
  // No way to spot a write in a destructuring except for default values ?
  expect(symbols.getUsage(getNode(sourceFile, "dstruct1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "arrDStruct1")).flags).toBe(UsageFlag.DECLARATION);
  expect(symbols.getUsage(getNode(sourceFile, "_")).flags).toBe(UsageFlag.DECLARATION);
  /*
    Maybe implement some day :
    TypeAliasDeclaration
    IndexSignatureDeclaration
    MethodDeclaration
    PropertyDeclaration
    ConstructorDeclaration
  */
});

it("writes", () => {
  expect(symbols.getUsage(getNode(sourceFile, "local", 19)).flags).toBe(UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "decAndInit")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "pWithDefault")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "read", 23)).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "varEl2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "dstruct2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "arrDStruct2")).flags).toBe(UsageFlag.DECLARATION | UsageFlag.WRITE);
});

it("reads", () => {
  expect(symbols.getUsage(getNode(sourceFile, "read", 27)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 29)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 31)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 32)).flags).toBe(UsageFlag.READ);
  expect(symbols.getUsage(getNode(sourceFile, "read", 35)).flags).toBe(UsageFlag.READ);
  // expect(symbols.getUsage(getNode(sourceFile, "exported")).flags).toBe(UsageFlag.READ | UsageFlag.WRITE | UsageFlag.DECLARATION);
});

it("read-writes", () => {
  expect(symbols.getUsage(getNode(sourceFile, "rw", 62)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 63)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 64)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 65)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 66)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
  expect(symbols.getUsage(getNode(sourceFile, "rw", 67)).flags).toBe(UsageFlag.READ | UsageFlag.WRITE);
});
