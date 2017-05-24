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
  graph.addStart(block("foo"));
  expect(toVis(graph)).toEqual({ nodes: new DataSet([visNode("1", "foo")]) });
});

it("should create multi-element block", () => {
  graph.addStart(block("a", "b"));
  expect(toVis(graph)).toEqual({ nodes: new DataSet([visNode("1", "a", "b")]) });
});

it("should create edge to the same block", () => {
  const a = block("a");
  graph.addStart(a);
  a.addSuccessor(a);
  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visNode("1", "a")]),
    edges: new DataSet([{ id: "1-1", from: "1", to: "1", arrows: "to" }]),
  });
});

it("should create branch", () => {
  const trueBlock = block("true");
  const falseBlock = block("false");
  const condition = branchingBlock(trueBlock, falseBlock, "condition");
  graph.addStart(condition);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([
      visBranchingNode("1", "condition"),
      visNode("1.1", "true"),
      visNode("1.2", "false"),
    ]),

    edges: new DataSet([
      { id: "1-1.1", from: "1", to: "1.1", arrows: "to", label: "true" },
      { id: "1-1.2", from: "1", to: "1.2", arrows: "to", label: "false" },
    ]),
  });
});

it("should create a loop between nodes", () => {
  const body = block("body");
  const end = block("end");
  const condition = branchingBlock(body, end, "condition");

  graph.addStart(condition);
  body.addSuccessor(condition);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([
      visBranchingNode("1", "condition"),
      visNode("1.1", "body"),
      visNode("1.2", "end"),
    ]),
    edges: new DataSet([
      { id: "1-1.1", from: "1", to: "1.1", arrows: "to", label: "true" },
      { id: "1-1.2", from: "1", to: "1.2", arrows: "to", label: "false" },
      { id: "1.1-1", from: "1.1", to: "1", arrows: "to" },
    ]),
  });
});

function branchingBlock(
    trueSuccessor: cfg.CfgBlock,
    falseSuccessor: cfg.CfgBlock,
    ...elements: string[],
  ): cfg.CfgBranchingBlock {
  const block = new cfg.CfgBranchingBlock("branching", trueSuccessor, falseSuccessor);
  addElements(block, ...elements);
  return block;
}

function block(...elements: string[]): cfg.CfgBlock {
  const block = new cfg.CfgBlock();
  addElements(block, ...elements);
  return block;
}

function addElements(block: cfg.CfgBlock, ... elements: string[]) {
  [...elements].reverse().forEach(e => block.addElement({ getText() { return e; } } as any));
}

function visNode(id: string, ...elements: string[]) {
  return { id, label: [id].concat(elements).join("\n"), physics: false };
}

function visBranchingNode(id: string, ...elements: string[]) {
  return { id, label: [id].concat(elements).concat(["<branching>"]).join("\n"), physics: false };
}
