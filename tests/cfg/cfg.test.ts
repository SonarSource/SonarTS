import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";

it("empty block", () => {
  expect(takeSingleLabel(buildVisFromSource(""))).toMatchSnapshot();
});

it("identifier expression", () => {
  expect(takeSingleLabel(buildVisFromSource("a;"))).toMatchSnapshot();
});

it("call expression", () => {
  expect(takeSingleLabel(buildVisFromSource("a();"))).toMatchSnapshot();
});

it("call expression with parameters", () => {
  expect(takeSingleLabel(buildVisFromSource("a(b);"))).toMatchSnapshot();
  expect(takeSingleLabel(buildVisFromSource("a(b, c);"))).toMatchSnapshot();
});

it("conditional expression", () => {
  expect(takeData(buildVisFromSource("a ? b : c"))).toMatchSnapshot();
});

function buildVisFromSource(source: string) {
  const sourceFile = tslint.getSourceFile("", source);
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  return toVis(cfg);
}

function takeSingleLabel(data: VisData) {
  return data.nodes.get(0).label;
}

function takeData(data: VisData) {
  return {
    nodes: data.nodes.get(),
    edges: data.edges.get(),
  };
}
