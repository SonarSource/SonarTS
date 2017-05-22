import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";

it("should build an empty block", () => {
  expect(takeSingleLabel(buildVisFromSource(""))).toMatchSnapshot();
});

it("should build a single element block", () => {
  expect(takeSingleLabel(buildVisFromSource("a;"))).toMatchSnapshot();
});

it("should build a block with call expression", () => {
  expect(takeSingleLabel(buildVisFromSource("a();"))).toMatchSnapshot();
});

it("should build a block with call expression with parameters", () => {
  expect(takeSingleLabel(buildVisFromSource("a(b);"))).toMatchSnapshot();
  expect(takeSingleLabel(buildVisFromSource("a(b, c);"))).toMatchSnapshot();
});

function buildVisFromSource(source: string) {
  const sourceFile = tslint.getSourceFile("", source);
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  return toVis(cfg);
}

function takeSingleLabel(data: VisData) {
  return data.nodes.get(0).label;
}
