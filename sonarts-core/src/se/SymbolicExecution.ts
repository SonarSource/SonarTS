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

const BLOCK_VISITS_LIMIT = 1000;

export type ProgramNodes = Map<ts.Node, ProgramState[]>;

export interface ExecutionResult {
  programNodes: ProgramNodes;
  branchingProgramNodes: ProgramNodes;
  visits: number;
}

export function execute(
  cfg: ControlFlowGraph,
  program: ts.Program,
  initialState: ProgramState,
  shouldTrackSymbol: (symbol: ts.Symbol) => boolean = () => true,
): ExecutionResult | undefined {
  const programNodes: ProgramNodes = new Map();
  const branchingProgramNodes: ProgramNodes = new Map();
  let visits = 0;
  visitBlock(cfg.start, initialState);
  if (visitsLimitBreached()) {
    // Analysis incomplete, it's safer to not report partial results
    return undefined;
  } else {
    return { programNodes, branchingProgramNodes, visits };
  }

  function visitBlock(block: CfgBlock, programState: ProgramState) {
    if (block instanceof CfgBranchingBlock && block.getElements().length > 0) {
      const existingStates = programNodes.get(block.getElements()[0]) || [];
      if (existingStates.find(existingState => programState.isEqualTo(existingState))) {
        return;
      }
    }
    if (visitsLimitBreached()) {
      return;
    }
    visits++;
    for (const programPoint of block.getElements()) {
      programState = visitProgramPoint(programPoint, programState);
    }

    // ignore for-of, for-in and switch, because we can't constrain right element
    if (block instanceof CfgBranchingBlock && !isForInOfLoop(block) && !isSwitch(block)) {
      addToBranchingNodes(block, programState);
      visitBranchingBlock(block, programState);
    } else {
      for (const successor of block.getSuccessors()) {
        visitBlock(successor, programState);
      }
    }
  }

  function visitBranchingBlock(block: CfgBranchingBlock, programState: ProgramState) {
    let truthyState = programState.constrainToTruthy();
    let falsyState = programState.constrainToFalsy();

    // if we are inside a branching statement, remove its expression from the stack
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
  }

  function visitsLimitBreached() {
    return visits >= BLOCK_VISITS_LIMIT;
  }

  function visitProgramPoint(programPoint: ts.Node, programState: ProgramState) {
    addToProgramNodes(programPoint, programState);
    return applyExecutors(programPoint, programState, program, shouldTrackSymbol);
  }

  function addToProgramNodes(programPoint: ts.Node, programState: ProgramState) {
    const visitedStates = programNodes.get(programPoint) || [];
    const nextVisitedStates = [...visitedStates, programState];
    programNodes.set(programPoint, nextVisitedStates);
  }

  function addToBranchingNodes(block: CfgBranchingBlock, programState: ProgramState) {
    const lastElement = block.getElements()[block.getElements().length - 1];
    const existingStates = branchingProgramNodes.get(lastElement) || [];
    branchingProgramNodes.set(lastElement, [...existingStates, programState]);
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
