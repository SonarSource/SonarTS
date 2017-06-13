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

let graph: cfg.ControlFlowGraph;
let blockCounter;

beforeEach(() => {
  graph = new cfg.ControlFlowGraph();
  blockCounter = 0;
});

it("should create single block with one element", () => {
  const block = createBlock("foo");
  graph.addStart(block);
  expect(toVis(graph)).toEqual({ nodes: new DataSet([visNode("1", block)]) });
});

it("should create multi-element block", () => {
  const block = createBlock("a", "b");
  graph.addStart(block);
  expect(toVis(graph)).toEqual({ nodes: new DataSet([visNode("1", block)]) });
});

it("should create edge to the same block", () => {
  const a = createBlock("a");
  graph.addStart(a);
  a.addSuccessor(a);
  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visNode("1", a)]),
    edges: new DataSet([{ id: 0, from: "1", to: "1", arrows: "to" }]),
  });
});

it("should create branch", () => {
  const trueBlock = createBlock("true");
  const falseBlock = createBlock("false");
  const condition = branchingBlock(trueBlock, falseBlock, "condition");
  graph.addStart(condition);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visBranchingNode("1", condition), visNode("1.1", trueBlock), visNode("1.2", falseBlock)]),

    edges: new DataSet([
      { id: 0, from: "1", to: "1.1", arrows: "to", label: "true" },
      { id: 1, from: "1", to: "1.2", arrows: "to", label: "false" },
    ]),
  });
});

it("should create a loop between nodes", () => {
  const body = createBlock("body");
  const end = createBlock("end");
  const condition = branchingBlock(body, end, "condition");

  graph.addStart(condition);
  body.addSuccessor(condition);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visBranchingNode("1", condition), visNode("1.1", body), visNode("1.2", end)]),
    edges: new DataSet([
      { id: 0, from: "1", to: "1.1", arrows: "to", label: "true" },
      { id: 1, from: "1", to: "1.2", arrows: "to", label: "false" },
      { id: 2, from: "1.1", to: "1", arrows: "to" },
    ]),
  });
});

it("should create unique edge ids", () => {
  const a = createBlock("a");
  const b = createBlock("a");
  a.addSuccessor(b);
  a.addSuccessor(b);
  graph.addStart(a);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visNode("1", a), visNode("1.1", b)]),
    edges: new DataSet([{ id: 0, from: "1", to: "1.1", arrows: "to" }, { id: 1, from: "1", to: "1.1", arrows: "to" }]),
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

function addElements(block: cfg.CfgBlock, ...elements: string[]) {
  [...elements].reverse().forEach(e =>
    block.addElement(
      {
        getText() {
          return e;
        },
      } as any,
    ),
  );
}

function visNode(id: string, block: cfg.CfgBlock) {
  return { id, label: block.getLabel(), physics: false };
}

function visBranchingNode(id: string, block: cfg.CfgBlock) {
  return { id, label: block.getLabel(), physics: false };
}
