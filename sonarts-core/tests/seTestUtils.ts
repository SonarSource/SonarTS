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
import * as ts from "typescript";
import * as tsutils from "tsutils";
import { is, descendants } from "../src/utils/navigation";
import { execute, ExecutionResult } from "../src/se/SymbolicExecution";
import { ProgramState, createInitialState } from "../src/se/programStates";
import { SymbolicValue } from "../src/se/symbolicValues";
import { build } from "../src/cfg/builder";
import { Constraint } from "../src/se/constraints";
import { SymbolTableBuilder } from "../src/symbols/builder";

export function inspectStack(source: string) {
  const { result } = executeFromSource(source);
  const { programStates } = findInspectCall(result);
  if (programStates.length !== 1) {
    throw new Error(`Expected 1 result, but got ${programStates.length}`);
  }
  const [top, nextState] = programStates[0].popSV();
  // compare with 1, because `_inspect` always pushes one expression to the stack
  return { top, empty: nextState.getStackSize() === 1 };
}

export function inspectConstraints(source: string): Constraint[] | undefined {
  const { result, program } = executeFromSource(source);
  const { programPoint, programStates } = findInspectCall(result);
  const identifiers = programPoint.arguments.filter(tsutils.isIdentifier);
  const symbols = identifiers.map(identifier => program.getTypeChecker().getSymbolAtLocation(identifier));
  const constraints = programStates.map(programState => {
    const value = programState.sv(symbols[0]);
    return programState.getConstraints(value)[0];
  });
  return constraints;
}

export function inspectSV(source: string) {
  const { result, program } = executeFromSource(source);
  return inspectSVFromResult(result, program);
}

export function executeOneFunction(source: string): { result: ExecutionResult; program: ts.Program } {
  const { sourceFile, program } = parse(source);
  const node = descendants(sourceFile).find(node =>
    is(node, ts.SyntaxKind.FunctionDeclaration),
  ) as ts.FunctionDeclaration;
  const result = execute(
    build(Array.from(node.body.statements)),
    SymbolTableBuilder.build(sourceFile, program),
    createInitialState(node as ts.FunctionDeclaration, program),
  );
  return { result, program };
}

export function inspectSVFromResult(result: ExecutionResult, program: ts.Program) {
  const { programPoint, programStates } = findInspectCall(result);
  const identifiers = programPoint.arguments.filter(tsutils.isIdentifier);
  const symbols = identifiers.map(identifier => program.getTypeChecker().getSymbolAtLocation(identifier));
  const sv: { [name: string]: SymbolicValue[] } = {};
  for (const symbol of symbols) {
    sv[symbol.name] = programStates.map(programState => programState.sv(symbol));
  }
  return sv;
}

function executeFromSource(source: string) {
  const { sourceFile, program } = parse(source);
  const result = execute(
    build(Array.from(sourceFile.statements))!,
    SymbolTableBuilder.build(sourceFile, program),
    ProgramState.empty(),
  );
  if (!result) {
    throw new Error("Symbolic execution did not return any result.");
  }
  return { result, program };
}

function parse(source: string) {
  const filename = "filename.ts";
  const host: ts.CompilerHost = {
    ...ts.createCompilerHost({ strict: true }),
    getSourceFile: () => ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true),
    getCanonicalFileName: () => filename,
  };
  const program = ts.createProgram([], { strict: true }, host);
  return { sourceFile: program.getSourceFiles()[0], program };
}

function findInspectCall(result: ExecutionResult) {
  for (const [programPoint, programStates] of result.programNodes.entries()) {
    if (
      tsutils.isCallExpression(programPoint) &&
      tsutils.isIdentifier(programPoint.expression) &&
      programPoint.expression.text === "_inspect"
    ) {
      return { programPoint, programStates };
    }
  }
}
