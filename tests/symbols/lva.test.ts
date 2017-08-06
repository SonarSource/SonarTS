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
import { ControlFlowGraph } from "../../src/cfg/cfg";
import { SymbolTableBuilder } from "../../src/symbols/builder";
import { SymbolTable, UsageFlag } from "../../src/symbols/table";
import { descendants, is, FUNCTION_LIKE } from "../../src/utils/navigation";
import { buildSymbolTable, getNode } from "./test_utils";
import { LiveVariableAnalyzer } from "../../src/symbols/lva";

it("linear", () => {
  const { symbols, sourceFile } = buildSymbolTable("sample_lva.ts");
  const func = findFunction(sourceFile, "linear");
  const cfg = ControlFlowGraph.fromStatements(func.body.statements);
  new LiveVariableAnalyzer(symbols).analyze(cfg);
  expect(symbols.getUsage(getNode(sourceFile, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(sourceFile, "y", 4)).dead).toBe(true);
});

function findFunction(sourceFile: ts.SourceFile, functionName: string): ts.FunctionDeclaration {
  return descendants(sourceFile)
    .filter(node => node.kind === ts.SyntaxKind.FunctionDeclaration)
    .map(node => node as ts.FunctionDeclaration)
    .find(func => func.name.getText() === functionName);
}
