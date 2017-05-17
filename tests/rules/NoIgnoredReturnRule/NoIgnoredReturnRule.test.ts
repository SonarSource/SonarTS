import { Rule } from "../../../src/rules/NoIgnoredReturnRule";
import { runRule, runRuleOnRuling } from "../../runRule";

it("test", () => {
  const result = runRule(Rule, __filename);
  expect(result.actualErrors).toEqual(result.expectedErrors);
});

it("ruling", () => {
  expect(runRuleOnRuling(Rule)).toMatchSnapshot();
});
