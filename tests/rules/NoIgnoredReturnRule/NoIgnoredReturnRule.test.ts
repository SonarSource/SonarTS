import { Rule } from "../../../src/rules/NoIgnoredReturnRule";
import { runRule, runRuleOnRuling } from "../../runRule";

it("test", () => {
  const { actualErrors, expectedErrors } = runRule(Rule, __filename);
  expect(actualErrors).toEqual(expectedErrors);
});

it("ruling", () => {
  expect(runRuleOnRuling(Rule)).toMatchSnapshot();
});
