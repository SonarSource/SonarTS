/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as fs from "fs";
import * as lodash from "lodash";
import * as path from "path";
import { executeRule } from "../../src/runner/rules";
import * as tslint from "tslint";
import * as ts from "typescript";
import { createProgram } from "../../src/utils/parser";

run();

function run() {
  const tsConfigFile = process.argv[2];
  const rules = getRules(process.argv[3]);
  const results = runRules(rules, tsConfigFile);
  console.log(JSON.stringify(results));
}

function getRules(rule?: string): tslint.Rules.AbstractRule[] {
  const dir = path.join(__dirname, "../../src/rules");
  if (rule) {
    return [require(path.join(dir, rule) as any).Rule];
  } else {
    return lodash
      .sortBy(fs.readdirSync(dir))
      .filter(file => file.includes("Rules.ts"))
      .map(file => require(path.join(dir, file) as any).Rule);
  }
}

function runRules(rules: tslint.Rules.AbstractRule[], tsConfigFile: string) {
  let results = {};
  const program = createProgram(tsConfigFile, path.dirname(tsConfigFile));
  const files = lodash.sortBy(getProgramFiles(program));
  files.forEach(file => {
    rules.forEach(Rule => {
      const rule = initRule(Rule);
      const errorLines = executeRule(rule, file, program).map(
        failure => failure.getStartPosition().getLineAndCharacter().line + 1,
      );
      const ruleName = (Rule as any).metadata.ruleName;
      results = addErrorsToResults(results, ruleName, getFileNameForSnapshot(file.fileName), errorLines);
    });
  });
  return results;
}

function initRule(Rule: any): tslint.IRule {
  const RULE_OPTIONS: tslint.IOptions = {
    disabledIntervals: [],
    ruleArguments: [],
    ruleName: "",
    ruleSeverity: "error",
  };
  return new Rule(RULE_OPTIONS);
}

function getProgramFiles(program: ts.Program): ts.SourceFile[] {
  return program.getSourceFiles().filter(file => !file.isDeclarationFile);
}

function addErrorsToResults(results: Results, ruleName: string, fileName: string, errorLines: number[]): Results {
  const nextResults = { ...results };
  if (!(ruleName in nextResults)) {
    nextResults[ruleName] = {};
  }

  if (errorLines.length > 0) {
    if (!(fileName in nextResults[ruleName])) {
      nextResults[ruleName][fileName] = [];
    }

    nextResults[ruleName][fileName] = [...nextResults[ruleName][fileName], ...errorLines];
  }
  return nextResults;
}

function getFileNameForSnapshot(path: string): string {
  const marker = "/typescript-test-sources/";
  const pos = path.indexOf(marker);
  return path.substr(pos + marker.length);
}

interface Results {
  [rule: string]: {
    [file: string]: number[];
  };
}
