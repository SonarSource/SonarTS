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
import { ControlFlowGraph, CfgBlock, CfgBranchingBlock } from "../cfg/cfg";
import { applyExecutors } from "./stateTransitions";
import { ProgramState } from "./programStates";
import { is } from "../utils/navigation";
import { getTruthyConstraint, getFalsyConstraint } from "./constraints";

export class SymbolicExecution {
  private static readonly BLOCK_VISITS_LIMIT = 1000;

  private readonly programNodes = new Map<ts.Node, ProgramState[]>();
  private readonly branchingProgramNodes = new Map<ts.Node, ProgramState[]>();
  private visits = 0;

  constructor(private readonly cfg: ControlFlowGraph, private readonly program: ts.Program) {}

  public execute(
    initialState: ProgramState,
    onProgramPoint?: ProgramPointCallback,
    onBranchingProgramPoint?: BranchingProgramPointCallback,
  ): boolean {
    this.visitBlock(this.cfg.start, initialState);
    if (this.visitsLimitBreached()) {
      console.log("Limit!");

      // Analysis incomplete, it's safer to not raise issues at all
      return false;
    } else {
      if (onProgramPoint) {
        this.processProgramPointCallbacks(onProgramPoint);
      }
      if (onBranchingProgramPoint) {
        this.processBranchingProgramPointCallbacks(onBranchingProgramPoint);
      }
      return true;
    }
  }

  private readonly visitBlock = (block: CfgBlock, programState: ProgramState) => {
    if (this.visitsLimitBreached()) {
      return;
    }
    this.visits++;
    for (const programPoint of block.getElements()) {
      const nextProgramState = this.visitProgramPoint(programPoint, programState);
      if (nextProgramState) {
        programState = nextProgramState;
      } else {
        return;
      }
    }

    if (block instanceof CfgBranchingBlock && !this.isForInOfLoop(block)) {
      const lastElement = block.getElements()[block.getElements().length - 1];
      const existingStates = this.branchingProgramNodes.get(lastElement) || [];
      this.branchingProgramNodes.set(lastElement, [...existingStates, programState]);

      if (programState.canBeConstrainedTo(getTruthyConstraint())) {
        this.visitBlock(block.getTrueSuccessor(), programState.constrainToTruthy());
      }
      if (programState.canBeConstrainedTo(getFalsyConstraint())) {
        this.visitBlock(block.getFalseSuccessor(), programState.constrainToFalsy());
      }
    } else {
      for (const successor of block.getSuccessors()) {
        this.visitBlock(successor, programState);
      }
    }
  };

  private readonly visitsLimitBreached = () => {
    return this.visits >= SymbolicExecution.BLOCK_VISITS_LIMIT;
  };

  private readonly processProgramPointCallbacks = (...callbacks: ProgramPointCallback[]) => {
    this.programNodes.forEach((programStates, programPoint) => {
      callbacks.forEach(callback => callback(programPoint, programStates));
    });
  };

  private readonly processBranchingProgramPointCallbacks = (...callbacks: BranchingProgramPointCallback[]) => {
    this.branchingProgramNodes.forEach((programStates, programPoint) => {
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

  private isForInOfLoop(block: CfgBranchingBlock) {
    return is(block.loopingStatement, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement);
  }
}

export interface ProgramPointCallback {
  (programPoint: ts.Node, programStates: ProgramState[]): void;
}

export interface BranchingProgramPointCallback {
  (programPoint: ts.Node, programStates: ProgramState[]): void;
}
