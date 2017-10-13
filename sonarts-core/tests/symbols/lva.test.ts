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

let symbols: SymbolTable;
let sourceFile: ts.SourceFile;

beforeEach(() => {
  ({ symbols, sourceFile } = buildSymbolTable("sample_lva.lint.ts"));
});

it("linear", () => {
  const func = liveVariableAnalysis("linear");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
});

it("simple if", () => {
  const func = liveVariableAnalysis("oneBranch");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
});

it("simple loop", () => {
  const func = liveVariableAnalysis("oneLoop");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 25)).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "x", 26)).dead).toBe(false);
});

it("loops and branches", () => {
  const func = liveVariableAnalysis("loopsAndBranches");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 39)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 47)).dead).toBe(true);

  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "y", 34)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 37)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 42)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 44)).dead).toBe(true);
});

it("ignore class fields", () => {
  const func = liveVariableAnalysis("someMethod");
  expect(symbols.getUsage(getNode(func, "x", 55)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y", 56)).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "y", 57)).dead).toBe(true);
});

it("ignore symbols used in nested functions", () => {
  const func = liveVariableAnalysis("containerMethod");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "x", 62)).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "y")).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "z")).dead).toBe(false);
});

it("destructuring", () => {
  const func = liveVariableAnalysis("destructuring");
  expect(symbols.getUsage(getNode(func, "x")).dead).toBe(false);
  expect(symbols.getUsage(getNode(func, "c", 82)).dead).toBe(true);
  expect(symbols.getUsage(getNode(func, "d", 82)).dead).toBe(true);
});

function liveVariableAnalysis(functionName: string) {
  const func = findFunction(functionName);
  new LiveVariableAnalyzer(symbols).analyze(func);
  return func;
}

function findFunction(functionName: string): ts.FunctionLikeDeclaration {
  return descendants(sourceFile)
    .filter(node => is(node, ...FUNCTION_LIKE))
    .map(node => node as ts.FunctionLikeDeclaration)
    .find(func => func.name.getText() === functionName);
}
