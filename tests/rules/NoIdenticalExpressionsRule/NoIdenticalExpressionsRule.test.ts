import { Rule } from "../../../src/rules/NoIdenticalExpressionsRule";
import { runRule, runRuleOnRuling } from "../../runRule";

it("raises error", () => {
  const { actualErrors, expectedErrors } = runRule(Rule, __filename);
  expect(actualErrors).toEqual(expectedErrors);
});

it("ruling", () => {
  expect(runRuleOnRuling(Rule)).toMatchSnapshot();
});
