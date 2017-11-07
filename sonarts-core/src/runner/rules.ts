/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as path from "path";
import * as ts from "typescript";
import * as tslint from "tslint";

const SONARTS_RULES_FOLDER = path.join(__dirname, "../../lib/rules");

export function getIssues(
  ruleConfigs: tslint.IOptions[],
  program: ts.Program,
  sourceFile: ts.SourceFile,
): { issues: any[] } {
  const rules = tslint.loadRules(ruleConfigs, SONARTS_RULES_FOLDER);
  let issues: tslint.RuleFailure[] = [];
  rules.forEach(rule => (issues = issues.concat(executeRule(rule, sourceFile, program))));
  return { issues: issues.map(issue => issue.toJson()) };
}

export function executeRule(rule: tslint.IRule, sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
  try {
    if (isTypedRule(rule)) {
      return rule.applyWithProgram(sourceFile, program);
    } else {
      return rule.apply(sourceFile);
    }
  } catch (error) {
    console.error("Rule error during analysis of : " + sourceFile.fileName, error);
    return [];
  }
}

function isTypedRule(rule: tslint.IRule): rule is tslint.ITypedRule {
  return "applyWithProgram" in rule;
}
