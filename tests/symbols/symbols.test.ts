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
import { UsageFlag } from "../../src/symbols/table";
import { descendants, is } from "../../src/utils/navigation";
import { parseFile } from "../../src/utils/parser";

it("should identify declarations", () => {
  const { sourceFile, program } = parseFile(path.join(__dirname, "sample_symbols.ts"));
  const symbols = SymbolTableBuilder.build(sourceFile, program);
  const declaration = descendants(sourceFile).filter(node => is(node, ts.SyntaxKind.Identifier))[0];
  expect(symbols.getUsage(declaration).flags & UsageFlag.DECLARATION).not.toBe(0);
});

it("should distinguish between declaration and write", () => {
  const { sourceFile, program } = parseFile(path.join(__dirname, "sample_symbols.ts"));
  const symbols = SymbolTableBuilder.build(sourceFile, program);
  const write = descendants(sourceFile).filter(node => is(node, ts.SyntaxKind.Identifier))[1];
  expect(symbols.getUsage(write).flags & UsageFlag.WRITE).not.toBe(0);
});
