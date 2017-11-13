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
import { build as buildCfg } from "../cfg/builder";
import { ControlFlowGraph, CfgBlock } from "../cfg/cfg";
import { applyExecutors } from "./stateTransitions";
import { ProgramState } from "./programStates";

export class SymbolicExecution {
  private readonly cfg: ControlFlowGraph | undefined;
  private readonly program: ts.Program;
  private readonly programNodes = new Map<ts.Node, ProgramState[]>();

  constructor(statements: ts.Statement[], program: ts.Program) {
    this.cfg = buildCfg(statements);
    this.program = program;
  }

  public execute(callback: SECallback) {
    if (this.cfg) {
      const programState = ProgramState.empty();
      this.visitBlock(this.cfg.start, programState);
      this.processCallbacks(callback);
    }
  }

  private readonly visitBlock = (block: CfgBlock, programState: ProgramState) => {
    for (const programPoint of block.getElements()) {
      const nextProgramState = this.visitProgramPoint(programPoint, programState);
      if (nextProgramState) {
        programState = nextProgramState;
      } else {
        return;
      }
    }

    for (const successor of block.getSuccessors()) {
      this.visitBlock(successor, programState);
    }
  };

  private readonly processCallbacks = (...callbacks: SECallback[]) => {
    this.programNodes.forEach((programStates, programPoint) => {
      callbacks.forEach(callback => callback(programPoint, programStates));
    });
  };

  /** 
   * Visit a program point with a given program state to produce next program state.
   * @returns `undefined` if the program point with next program state was already visited, 
   * @returns next program state otherwise
   */
  private visitProgramPoint(programPoint: ts.Node, programState: ProgramState) {
    const visitedStates = this.programNodes.get(programPoint) || [];
    if (!this.isVisitedProgramState(visitedStates, programState)) {
      const nextProgramState = applyExecutors(programPoint, programState, this.program);
      const nextVisitedStates = [...visitedStates, programState];
      this.programNodes.set(programPoint, nextVisitedStates);
      return nextProgramState;
    }
  }

  private isVisitedProgramState(visitedState: ProgramState[], programState: ProgramState) {
    for (const existingState of visitedState) {
      if (existingState.isEqualTo(programState)) {
        return true;
      }
    }
    return false;
  }
}

export interface SECallback {
  (node: ts.Node, programStates: ProgramState[]): void;
}
