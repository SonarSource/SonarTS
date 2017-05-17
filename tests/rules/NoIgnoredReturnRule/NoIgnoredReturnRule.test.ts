import { Rule } from "../../../src/rules/NoIgnoredReturnRule";
import { runRule } from "../../runRule";

it("test", () => {
  const result = runRule(Rule, __filename);
  expect(result.actualErrors).toEqual(result.expectedErrors);
});
