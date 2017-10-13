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
import * as tslint from "tslint";
import * as ts from "typescript";
import { DataSet } from "vis";
import * as cfg from "../../../src/cfg/cfg";
import toVis from "../../../src/tools/cfg_viewer/transformer";

const START = "START\n";

it("should create single block with one element", () => {
  const block = createBlock("foo");
  expect(toVis(createGraph(block))).toEqual({ nodes: new DataSet([visNode(0, block, START)]) });
});

it("should create multi-element block", () => {
  const block = createBlock("a", "b");
  expect(toVis(createGraph(block))).toEqual({ nodes: new DataSet([visNode(0, block, START)]) });
});

it("should create edge to the same block", () => {
  const selfReferencing = createBlock("a");
  selfReferencing.addSuccessor(selfReferencing);
  expect(toVis(createGraph(selfReferencing))).toEqual({
    nodes: new DataSet([visNode(0, selfReferencing, START)]),
    edges: new DataSet([{ id: 0, from: 0, to: 0, arrows: "to" }]),
  });
});

it("should create branch", () => {
  const trueBlock = createBlock("true");
  const falseBlock = createBlock("false");
  const condition = branchingBlock(trueBlock, falseBlock, "condition");

  expect(toVis(createGraph(condition, trueBlock, falseBlock))).toEqual({
    nodes: new DataSet([visBranchingNode(0, condition, START), visNode(1, trueBlock), visNode(2, falseBlock)]),

    edges: new DataSet([
      { id: 0, from: 0, to: 1, arrows: "to", label: "true" },
      { id: 1, from: 0, to: 2, arrows: "to", label: "false" },
    ]),
  });
});

it("should create a loop between nodes", () => {
  const body = createBlock("body");
  const end = createBlock("end");
  const condition = branchingBlock(body, end, "condition");

  body.addSuccessor(condition);

  expect(toVis(createGraph(condition, body, end))).toEqual({
    nodes: new DataSet([visBranchingNode(0, condition, START), visNode(1, body), visNode(2, end)]),
    edges: new DataSet([
      { id: 0, from: 0, to: 1, arrows: "to", label: "true" },
      { id: 1, from: 0, to: 2, arrows: "to", label: "false" },
      { id: 2, from: 1, to: 0, arrows: "to" },
    ]),
  });
});

it("should create unique edge ids", () => {
  const a = createBlock("a");
  const b = createBlock("a");
  a.addSuccessor(b);
  a.addSuccessor(b);

  expect(toVis(createGraph(a, b))).toEqual({
    nodes: new DataSet([visNode(0, a, START), visNode(1, b)]),
    edges: new DataSet([{ id: 0, from: 0, to: 1, arrows: "to" }, { id: 1, from: 0, to: 1, arrows: "to" }]),
  });
});

// prettier removes dangling comma below
// prettier-ignore
function branchingBlock(
  trueSuccessor: cfg.CfgBlock,
  falseSuccessor: cfg.CfgBlock,
  ...elements: string[],
): cfg.CfgBranchingBlock {
  const block = new cfg.CfgBranchingBlock("branching", trueSuccessor, falseSuccessor);
  addElements(block, ...elements);
  return block;
}

function createBlock(...elements: string[]): cfg.CfgGenericBlock {
  const block = new cfg.CfgGenericBlock();
  addElements(block, ...elements);
  return block;
}

function createGraph(...blocks: cfg.CfgBlock[]) {
  return new cfg.ControlFlowGraph(blocks[0], new cfg.CfgEndBlock(), blocks);
}

function addElements(block: cfg.CfgBlock, ...elements: string[]) {
  [...elements].reverse().forEach(e =>
    block.addElement({
      getText() {
        return e;
      },
    } as any),
  );
}

function visNode(id: number, block: cfg.CfgBlock, startPrefix = "") {
  return { id, label: startPrefix + block.getLabel(), physics: false };
}

function visBranchingNode(id: number, block: cfg.CfgBlock, startPrefix = "") {
  return { id, label: startPrefix + block.getLabel(), physics: false };
}
