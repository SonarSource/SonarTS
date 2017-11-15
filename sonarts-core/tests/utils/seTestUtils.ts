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
import { SymbolicExecution, BranchingProgramPointCallback } from "../../src/se/SymbolicExecution";
import { ProgramState } from "../../src/se/programStates";
import { isEqual } from "lodash";
import { SymbolicValue, createUnknownSymbolicValue } from "../../src/se/symbolicValues";
import { build } from "../../src/cfg/builder";
import { isFunctionDeclaration } from "tsutils";
import { Constraint } from "../../src/se/constraints";

export function runStack(source: string, callback: StackTestCallBack) {
  run(source, (node, states, symbols) => {
    const [top, nextState] = states[0].popSV();
    // compare with 1, because `_inspectStack` always pushes one expression to the stack
    callback(top, nextState.getStackSize() === 1);
  });
}

export function runConstraints(source: string, callback: ConstraintsTestCallback) {
  run(source, (node, states, symbols) => {
    const onlySymbol = symbols.get(symbols.keys().next().value);
    const allConstraints = states.map(state => {
      const stateConstraints = state.getConstraints(state.sv(onlySymbol));
      if (stateConstraints.length > 1) {
        throw new Error(`Symbolic value for "${onlySymbol.name}" unexpectedly has more than one constraint`);
      }
      return stateConstraints[0];
    });
    callback(allConstraints);
  });
}

export function run(
  source: string,
  callback?: SETestCallback,
  onBranchingProgramPoint?: BranchingProgramPointCallback,
) {
  const filename = "filename.ts";
  const host: ts.CompilerHost = {
    ...ts.createCompilerHost({ strict: true }),
    getSourceFile: () => ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true),
    getCanonicalFileName: () => filename,
  };
  const program = ts.createProgram([], { strict: true }, host);
  const sourceFile = program.getSourceFiles()[0];

  const se = new SymbolicExecution(build(Array.from(sourceFile.statements))!, program);

  return se.execute(
    createInitialState(),
    (node, state) => {
      const map = isInspectNode(node, program);
      if (map) {
        callback(node, state, map);
      }
    },
    onBranchingProgramPoint,
  );
}

function createInitialState() {
  return ProgramState.empty();
}

function isInspectNode(node: ts.Node, program: ts.Program): Map<string, ts.Symbol> | undefined {
  if (tsutils.isCallExpression(node) && tsutils.isIdentifier(node.expression)) {
    if (node.expression.text === "_inspect") {
      const symbols = new Map<string, ts.Symbol>();
      const identifiers = node.arguments.filter(tsutils.isIdentifier);
      identifiers.forEach(identifier =>
        symbols.set(identifier.text, program.getTypeChecker().getSymbolAtLocation(identifier)),
      );
      return symbols;
    }
    if (node.expression.text === "_inspectStack") {
      return new Map<string, ts.Symbol>();
    }
  }
  return undefined;
}

export interface SETestCallback {
  (node: ts.Node, programStates: ProgramState[], inspectedSymbos: Map<string, ts.Symbol>): void;
}

export interface StackTestCallBack {
  (top: SymbolicValue, empty: boolean): void;
}

export interface ConstraintsTestCallback {
  (constraints: Constraint[] | undefined): void;
}
