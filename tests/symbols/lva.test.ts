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
import { LiveVariableAnalyzer } from "../../src/symbols/lva";
import { SymbolTable, UsageFlag } from "../../src/symbols/table";
import { descendants, FUNCTION_LIKE, is } from "../../src/utils/navigation";
import { buildSymbolTable, getNode } from "./test_utils";

const { symbols, sourceFile } = buildSymbolTable("sample_lva.ts");

it("linear", () => {
  const func = findFunction("linear");
  const cfg = ControlFlowGraph.fromStatements(func.body.statements);
  new LiveVariableAnalyzer(symbols).analyze(cfg);
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
});

it("oneBranch", () => {
  const func = findFunction("oneBranch");
  const cfg = ControlFlowGraph.fromStatements(func.body.statements);
  new LiveVariableAnalyzer(symbols).analyze(cfg);
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
});

it("oneLoop", () => {
  const func = findFunction("oneLoop");
  const cfg = ControlFlowGraph.fromStatements(func.body.statements);
  new LiveVariableAnalyzer(symbols).analyze(cfg);
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 25)).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "x", 26)).dead).toBe(false);
});

it("loopsAndBranches", () => {
  const func = findFunction("loopsAndBranches");
  const cfg = ControlFlowGraph.fromStatements(func.body.statements);
  new LiveVariableAnalyzer(symbols).analyze(cfg);
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 39)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 47)).dead).toBe(true);

  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "y", 34)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 37)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 42)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 44)).dead).toBe(true);
});

function findFunction(functionName: string): ts.FunctionDeclaration {
  return descendants(sourceFile)
    .filter(node => node.kind === ts.SyntaxKind.FunctionDeclaration)
    .map(node => node as ts.FunctionDeclaration)
    .find(func => func.name.getText() === functionName);
}
