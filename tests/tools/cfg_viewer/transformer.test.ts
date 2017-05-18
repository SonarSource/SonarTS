import * as tslint from "tslint";
import * as ts from "typescript";
import {DataSet} from "vis";
import * as cfg from "../../../src/cfg/cfg";
import toVis from "../../../src/tools/cfg_viewer/transformer";

let graph;
let blockCounter;

beforeEach(() => {
  graph = new cfg.ControlFlowGraph();
  blockCounter = 0;
});

it("should create single block with one element", () => {
  graph.addBlock(block("foo"));
  expect(toVis(graph)).toEqual({nodes: new DataSet([visNode(0, "foo")])});
});

it("should create multi-element block", () => {
  graph.addBlock(block("a", "b"));
  expect(toVis(graph)).toEqual({nodes: new DataSet([visNode(0, "a", "b")])});
});

it("should create multi-block", () => {
  graph.addBlock(block("a"));
  graph.addBlock(block("b"));
  expect(toVis(graph)).toEqual({nodes: new DataSet([visNode(0, "a"), visNode(1, "b")])});
});

it("should create edge to the same block", () => {
  const a = block("a");
  graph.addBlock(a);
  a.addSuccessor(a);
  expect(toVis(graph)).toEqual({
    nodes: new DataSet([visNode(0, "a")]),
    edges: new DataSet([{id: "0-0", from: 0, to: 0, arrows: "to"}]),
  });
});

it("should create branch", () => {
  const condition = block("condition");
  const trueBlock = block("true");
  const falseBlock = block("false");
  graph.addBlock(condition);
  graph.addBlock(trueBlock);
  graph.addBlock(falseBlock);
  condition.addSuccessor(trueBlock);
  condition.addSuccessor(falseBlock);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([
      visNode(0, "condition"),
      visNode(1, "true"),
      visNode(2, "false"),
    ]),

    edges: new DataSet([
      {id: "0-1", from: 0, to: 1, arrows: "to"},
      {id: "0-2", from: 0, to: 2, arrows: "to"},
    ]),
  });
});

it("should create a loop between nodes", () => {
  const condition = block("condition");
  const body = block("body");
  const end = block("end");

  graph.addBlock(condition);
  graph.addBlock(body);
  graph.addBlock(end);
  condition.addSuccessor(body);
  condition.addSuccessor(end);
  body.addSuccessor(condition);

  expect(toVis(graph)).toEqual({
    nodes: new DataSet([
      visNode(0, "condition"),
      visNode(1, "body"),
      visNode(2, "end"),
    ]),
    edges: new DataSet([
      {id: "0-1", from: 0, to: 1, arrows: "to"},
      {id: "0-2", from: 0, to: 2, arrows: "to"},
      {id: "1-0", from: 1, to: 0, arrows: "to"},
    ]),
  });
});

function block(...elements: string[]): cfg.CfgBlock {
  const block = new cfg.CfgBlock(blockCounter);
  blockCounter++;
  elements.forEach(e => block.addElement({getText() { return e; }} as any));
  return block;
}

function visNode(id: number, ...elements: string[]) {
  return {id, label: [id.toString()].concat(elements).join("\n"), physics: false};
}
