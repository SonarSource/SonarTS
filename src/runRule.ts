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
import * as fs from "fs";
import * as path from "path";
import * as tslint from "tslint";
import { parseErrorsFromMarkup } from "tslint/lib/test/parse";
import * as ts from "typescript";

export interface IPositionInFile {
  line: number;
  col: number;
}

export interface ILintError {
  startPos: IPositionInFile;
  endPos: IPositionInFile;
  message: string;
}

export interface IRuleRunResult {
  actualErrors: ILintError[];
  expectedErrors: ILintError[];
}

/**
 * Run rule againts a lint file
 * Use from the test: runRule(Rule, __filename) if lint file name matches the test file name
 */
export default function runRule(Rule: any, testFileName: string): IRuleRunResult {
  const options: tslint.IOptions = {
    disabledIntervals: [],
    ruleArguments: [],
    ruleName: "",
    ruleSeverity: "error",
  };
  const rule = new Rule(options);
  const lintFileName = getLintFileName(testFileName);
  const { source, sourceWithFailures } = getSources(lintFileName);
  const sourceFile = tslint.getSourceFile(testFileName, source);
  const failures = rule.apply(sourceFile);
  const actualErrors = mapToLintErrors(failures);
  const expectedErrors = parseErrorsFromMarkup(sourceWithFailures);
  return { actualErrors, expectedErrors };
}

function getLintFileName(testFileName: string) {
  const baseName = path.basename(testFileName, ".test.ts");
  return path.join(__dirname, `./rules/${baseName}.lint`);
}

function getSources(fileName: string) {
  const sourceWithFailures = fs.readFileSync(fileName, "utf-8");
  const source = sourceWithFailures
    .split("\n")
    .filter((line) => line.indexOf("~") === -1)
    .join("\n");
  return { source, sourceWithFailures };
}

function mapToLintErrors(failures: tslint.RuleFailure[]) {
  return failures.map((failure) => {
    const startPosition = failure.getStartPosition().getLineAndCharacter();
    const endPosition = failure.getEndPosition().getLineAndCharacter();
    return {
      endPos: { col: endPosition.character, line: endPosition.line },
      message: failure.getFailure(),
      startPos: { col: startPosition.character, line: startPosition.line },
    };
  });
}
