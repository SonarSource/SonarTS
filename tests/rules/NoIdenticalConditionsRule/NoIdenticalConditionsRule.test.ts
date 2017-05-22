import { Rule } from "../../../src/rules/NoIdenticalConditionsRule";
import runRule from "../../runRule";

it("raises error", () => {
  const { actualErrors, expectedErrors } = runRule(Rule, __filename);
  expect(actualErrors).toEqual(expectedErrors);
});
