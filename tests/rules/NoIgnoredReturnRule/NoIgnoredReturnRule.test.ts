import { Rule } from "../../../src/rules/NoIgnoredReturnRule";
import { runRule, runRuleOnRuling } from "../../runRule";

it("unit test", () => {
  const { actualErrors, expectedErrors } = runRule(Rule, __filename);
  expect(actualErrors).toEqual(expectedErrors);
});

it("ruling test", () => {
  expect(runRuleOnRuling(Rule)).toMatchSnapshot();
});
