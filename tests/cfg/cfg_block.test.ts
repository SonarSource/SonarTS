import * as ts from "typescript";
import { CfgBlock, CfgBlockWithPredecessors, CfgGenericBlock } from "../../src/cfg/cfg";

it("should create simple label", () => {
  const block = new CfgGenericBlock();
  block.addElement({ getText() { return "a"; } } as ts.Node);
  expect(block.getLabel()).toBe("a");
});

it("should create multi-line label", () => {
  const block = new CfgGenericBlock();
  block.addElement({ getText() { return "a"; } } as ts.Node);
  block.addElement({ getText() { return "b"; } } as ts.Node);
  expect(block.getLabel()).toBe("b\na");
});
