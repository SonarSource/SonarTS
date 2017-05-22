import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis from "../../src/tools/cfg_viewer/transformer";

it("should build an empty block", () => {
  expect(buildVisFromSource("")).toMatchSnapshot();
});

it("should build a single element block", () => {
  expect(buildVisFromSource("a;")).toMatchSnapshot();
});

it("should build a block with call expression", () => {
  expect(buildVisFromSource("a();")).toMatchSnapshot();
});

function buildVisFromSource(source: string) {
  const sourceFile = tslint.getSourceFile("", source);
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  return toVis(cfg);
}
