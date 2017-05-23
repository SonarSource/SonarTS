import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";

it("empty block", () => {
  expect(takeData(buildVisFromSource(""))).toMatchSnapshot();
});

it("literals", () => {
  expect(takeData(buildVisFromSource("'literal'"))).toMatchSnapshot();
  expect(takeData(buildVisFromSource("1"))).toMatchSnapshot();
});

it("identifier expression", () => {
  expect(takeData(buildVisFromSource("a;"))).toMatchSnapshot();
});

it("call expression", () => {
  expect(takeData(buildVisFromSource("a();"))).toMatchSnapshot();
});

it("call expression with parameters", () => {
  expect(takeData(buildVisFromSource("a(b);"))).toMatchSnapshot();
  expect(takeData(buildVisFromSource("a(b, c);"))).toMatchSnapshot();
});

it("assignment", () => {
  expect(takeData(buildVisFromSource("x = 'something'"))).toMatchSnapshot();
});

it("conditional expression", () => {
  expect(takeData(buildVisFromSource("a ? b : c"))).toMatchSnapshot();
});

it("assignment of conditional expression", () => {
  expect(takeData(buildVisFromSource("a = b ? c : d"))).toMatchSnapshot();
});

it("if statement", () => {
  expect(takeData(buildVisFromSource("if (a) b"))).toMatchSnapshot();
  expect(takeData(buildVisFromSource("if (a) { b }"))).toMatchSnapshot();
  expect(takeData(buildVisFromSource("if (a) { b } else { c }"))).toMatchSnapshot();
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
    edges: data.edges ? data.edges.get() : null,
  };
}
