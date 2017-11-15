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
import { join } from "path";
import * as ts from "typescript";
import * as tsutils from "tsutils";
import { is } from "../../src/utils/navigation";
import { parseString } from "../../src/utils/parser";
import { BranchingProgramPointCallback, execute, ExecutionResult } from "../../src/se/SymbolicExecution";
import { ProgramState } from "../../src/se/programStates";
import { isEqual } from "lodash";
import { SymbolicValue, createUnknownSymbolicValue } from "../../src/se/symbolicValues";
import { build } from "../../src/cfg/builder";
import { isFunctionDeclaration } from "tsutils";
import { Constraint } from "../../src/se/constraints";

export function inspectStack(source: string) {
  const { result } = executeFromSource(source);
  const { programPoint, programStates } = findInspectCall(result);
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
  const filename = "filename.ts";
  const host: ts.CompilerHost = {
    ...ts.createCompilerHost({ strict: true }),
    getSourceFile: () => ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true),
    getCanonicalFileName: () => filename,
  };
  const program = ts.createProgram([], { strict: true }, host);
  const sourceFile = program.getSourceFiles()[0];

  const result = execute(build(Array.from(sourceFile.statements))!, program, ProgramState.empty());
  if (!result) {
    throw new Error("Symbolic execution did not return any result.");
  }

  return { result, program };
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
