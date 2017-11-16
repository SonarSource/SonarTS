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
import { is, CONDITIONAL_STATEMENTS, LOOP_STATEMENTS } from "../utils/navigation";
import { getTruthyConstraint, getFalsyConstraint } from "./constraints";

const BLOCK_VISITS_LIMIT = 1000;

export function execute(
  cfg: ControlFlowGraph,
  program: ts.Program,
  initialState: ProgramState,
  shouldTrackSymbol: (symbol: ts.Symbol) => boolean = () => true,
): ExecutionResult | undefined {
  const programNodes = new Map<ts.Node, ProgramState[]>();
  const branchingProgramNodes = new Map<ts.Node, ProgramState[]>();
  let visits = 0;
  visitBlock(cfg.start, initialState);
  if (visitsLimitBreached()) {
    // Analysis incomplete, it's safer to not report partial results
    return;
  } else {
    return { programNodes, branchingProgramNodes, visits };
  }

  function visitBlock(block: CfgBlock, programState: ProgramState) {
    if (visitsLimitBreached()) {
      return;
    }
    visits++;
    for (const programPoint of block.getElements()) {
      const nextProgramState = visitProgramPoint(programPoint, programState);
      if (nextProgramState) {
        programState = nextProgramState;
      } else {
        return;
      }
    }

    // ignore for-of, for-in and switch, because we can't constrain right element
    if (block instanceof CfgBranchingBlock && !isForInOfLoop(block) && !isSwitch(block)) {
      const lastElement = block.getElements()[block.getElements().length - 1];
      const existingStates = branchingProgramNodes.get(lastElement) || [];
      branchingProgramNodes.set(lastElement, [...existingStates, programState]);

      // if we were inside a branching statement, clear the stack
      let truthyState = programState.canBeConstrainedTo(getTruthyConstraint())
        ? programState.constrainToTruthy()
        : undefined;
      let falsyState = programState.canBeConstrainedTo(getFalsyConstraint())
        ? programState.constrainToFalsy()
        : undefined;

      if (isStatement(block)) {
        truthyState = truthyState && truthyState.popSV()[1];
        falsyState = falsyState && falsyState.popSV()[1];
      }

      if (truthyState) {
        visitBlock(block.getTrueSuccessor(), truthyState);
      }
      if (falsyState) {
        visitBlock(block.getFalseSuccessor(), falsyState);
      }
    } else {
      for (const successor of block.getSuccessors()) {
        visitBlock(successor, programState);
      }
    }
  }

  function visitsLimitBreached() {
    return visits >= BLOCK_VISITS_LIMIT;
  }

  /** 
   * Visit a program point with a given program state to produce next program state.
   * @returns `undefined` if the program point with next program state was already visited, 
   * @returns next program state otherwise
   */
  function visitProgramPoint(programPoint: ts.Node, programState: ProgramState) {
    const visitedStates = programNodes.get(programPoint) || [];
    if (!isVisitedProgramState(visitedStates, programState)) {
      const nextProgramState = applyExecutors(programPoint, programState, program, shouldTrackSymbol);
      const nextVisitedStates = [...visitedStates, programState];
      programNodes.set(programPoint, nextVisitedStates);
      return nextProgramState;
    }
  }

  function isVisitedProgramState(visitedState: ProgramState[], programState: ProgramState) {
    for (const existingState of visitedState) {
      if (existingState.isEqualTo(programState)) {
        return true;
      }
    }
    return false;
  }

  function isForInOfLoop(block: CfgBranchingBlock) {
    return is(block.loopingStatement, ts.SyntaxKind.ForInStatement, ts.SyntaxKind.ForOfStatement);
  }

  function isStatement(block: CfgBranchingBlock) {
    return is(block.branchingElement, ...CONDITIONAL_STATEMENTS, ...LOOP_STATEMENTS);
  }

  function isSwitch(block: CfgBranchingBlock) {
    return is(block.branchingElement, ts.SyntaxKind.SwitchStatement);
  }
}

export interface ProgramPointCallback {
  (programPoint: ts.Node, programStates: ProgramState[]): void;
}

export interface BranchingProgramPointCallback {
  (programPoint: ts.Node, programStates: ProgramState[]): void;
}

export interface ExecutionResult {
  programNodes: Map<ts.Node, ProgramState[]>;
  branchingProgramNodes: Map<ts.Node, ProgramState[]>;
  visits: number;
}
