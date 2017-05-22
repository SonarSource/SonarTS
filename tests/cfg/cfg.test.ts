import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis from "../../src/tools/cfg_viewer/transformer";

it("should build an empty block", () => {
  const sourceFile = tslint.getSourceFile("xxx.ts", "");
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  expect(toVis(cfg)).toMatchSnapshot();
});

it("should build a single element block", () => {
  const sourceFile = tslint.getSourceFile("xxx.ts", "a;");
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  expect(toVis(cfg)).toMatchSnapshot();
});
