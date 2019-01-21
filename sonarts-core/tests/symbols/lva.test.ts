/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as ts from "typescript";
import { buildSymbolTable, getNode } from "./testUtils";
import { LiveVariableAnalyzer, LVAReturn } from "../../src/symbols/lva";
import { SymbolTable } from "../../src/symbols/table";
import { descendants } from "../../src/utils/navigation";
import { isFunctionLikeDeclaration } from "../../src/utils/nodes";

let symbols: SymbolTable;
let sourceFile: ts.SourceFile;

beforeAll(() => {
  ({ symbols, sourceFile } = buildSymbolTable("sampleLVA.lint.ts"));
});

function isDead(varName: string, func: ts.FunctionLikeDeclaration, lvaReturn: LVAReturn, line?: number) {
  return lvaReturn.deadUsages.has(symbols.getUsage(getNode(func, varName, line)));
}

it("linear", () => {
  const { func, lvaReturn } = liveVariableAnalysis("linear");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("y", func, lvaReturn)).toBe(true);
});

it("simple if", () => {
  const { func, lvaReturn } = liveVariableAnalysis("oneBranch");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("y", func, lvaReturn)).toBe(true);
});

it("simple loop", () => {
  const { func, lvaReturn } = liveVariableAnalysis("oneLoop");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("x", func, lvaReturn, 25)).toBe(true);
  expect(isDead("x", func, lvaReturn, 26)).toBe(false);
});

it("loops and branches", () => {
  const { func, lvaReturn } = liveVariableAnalysis("loopsAndBranches");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("x", func, lvaReturn, 39)).toBe(false);
  expect(isDead("x", func, lvaReturn, 47)).toBe(true);

  expect(isDead("y", func, lvaReturn)).toBe(true);
  expect(isDead("y", func, lvaReturn, 34)).toBe(false);
  expect(isDead("y", func, lvaReturn, 37)).toBe(false);
  expect(isDead("y", func, lvaReturn, 42)).toBe(false);
  expect(isDead("y", func, lvaReturn, 44)).toBe(true);
});

it("ignore class fields", () => {
  const { func, lvaReturn } = liveVariableAnalysis("someMethod");
  expect(isDead("x", func, lvaReturn, 55)).toBe(false);
  expect(isDead("y", func, lvaReturn, 56)).toBe(true);
  expect(isDead("y", func, lvaReturn, 57)).toBe(true);
});

it("ignore symbols used in nested functions", () => {
  const { func, lvaReturn } = liveVariableAnalysis("containerMethod");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("x", func, lvaReturn, 62)).toBe(false);
  expect(isDead("y", func, lvaReturn)).toBe(true);
  expect(isDead("z", func, lvaReturn)).toBe(false);
});

it("destructuring", () => {
  const { func, lvaReturn } = liveVariableAnalysis("destructuring");
  expect(isDead("x", func, lvaReturn)).toBe(false);
  expect(isDead("c", func, lvaReturn, 82)).toBe(true);
  expect(isDead("d", func, lvaReturn, 82)).toBe(true);
  expect(isDead("computedProp", func, lvaReturn)).toBe(false);
});

function liveVariableAnalysis(functionName: string): { func: ts.FunctionLikeDeclaration; lvaReturn: LVAReturn } {
  const func = findFunction(functionName);
  const lvaReturn = new LiveVariableAnalyzer(symbols).analyzeFunction(func);
  return { func, lvaReturn };
}

function findFunction(functionName: string): ts.FunctionLikeDeclaration {
  return descendants(sourceFile)
    .filter(isFunctionLikeDeclaration)
    .find(func => func.name.getText() === functionName);
}
