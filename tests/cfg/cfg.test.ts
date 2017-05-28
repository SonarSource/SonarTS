import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";

it("empty file", () => {
  expect(buildVisFromSource("")).toMatchSnapshot();
});

it("literals", () => {
  expect(buildVisFromSource("'literal'")).toMatchSnapshot();
  expect(buildVisFromSource("1")).toMatchSnapshot();
});

it("identifier expression", () => {
  expect(buildVisFromSource("a;")).toMatchSnapshot();
});

it("call expression", () => {
  expect(buildVisFromSource("a();")).toMatchSnapshot();
});

it("call expression with parameters", () => {
  expect(buildVisFromSource("a(b);")).toMatchSnapshot();
  expect(buildVisFromSource("a(b, c);")).toMatchSnapshot();
});

it("assignment", () => {
  expect(buildVisFromSource("x = 'something'")).toMatchSnapshot();
});

it("conditional expression", () => {
  expect(buildVisFromSource("a ? b : c")).toMatchSnapshot();
});

it("assignment of conditional expression", () => {
  expect(buildVisFromSource("a = b ? c : d")).toMatchSnapshot();
});

it("if statement", () => {
  expect(buildVisFromSource("if (a) b")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } c")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } else { c }")).toMatchSnapshot();
});

it("block", () => {
  expect(buildVisFromSource("{a;b;c;}")).toMatchSnapshot();
});

it("for loop", () => {
  expect(buildVisFromSource("for(;x;) {a;}")).toMatchSnapshot();
});

it("complete for loop", () => {
  expect(buildVisFromSource("for(x=0;x=true;x=1) {a;}")).toMatchSnapshot();
});

it("infinite for loop", () => {
  expect(buildVisFromSource("for(;;) {a;}")).toMatchSnapshot();
});

it("while loop", () => {
  expect(buildVisFromSource("while(true) {a;}")).toMatchSnapshot();
});

it("do while loop", () => {
  expect(buildVisFromSource("do {a;} while (true);")).toMatchSnapshot();
});

it("switch", () => {
  expect(buildVisFromSource("switch(k) { case 1: 'one'; case 2: 'two'; }")).toMatchSnapshot();
});

it("return", () => {
  expect(buildVisFromSource("if(a) {return true;} b;")).toMatchSnapshot();
});

function buildVisFromSource(source: string) {
  const sourceFile = tslint.getSourceFile("", source);
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  return takeData(toVis(cfg));
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
