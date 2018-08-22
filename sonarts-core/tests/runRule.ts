/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
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
import * as path from "path";
import * as tslint from "tslint";
import { parseFile, parseString } from "../src/utils/parser";
import { SonarIssue } from "../src/utils/sonarAnalysis";

const RULE_OPTIONS: tslint.IOptions = {
  disabledIntervals: [],
  ruleArguments: [],
  ruleName: "",
  ruleSeverity: "error",
};

export interface PositionInFile {
  line: number;
  col: number;
}

export interface LintError {
  startPos: PositionInFile;
  endPos: PositionInFile;
  message: string;
  cost?: number;
}

export interface SecondaryLocation {
  startPos: PositionInFile;
  endPos: PositionInFile;
  message: string;
}

/**
 * Run rule againts a lint file
 * Use from the test: runRule(Rule, __filename) if lint file name matches the test file name
 */
export default function runRule(Rule: any, testFileName: string, ...ruleArguments: any[]) {
  const lintFileName = getLintFileName(testFileName);
  return checkRule(Rule, lintFileName, ruleArguments);
}

/**
 * Run rule againts a specific lint file from a test directory
 * Use from the test: runRule(Rule, "myTestDir", "myTestFile"), ommitting '.lint.ts' suffix on test file
 */
export function runRuleWithLintFile(
  Rule: any,
  testDirectoryName: string,
  testFileName: string,
  ...ruleArguments: any[]
) {
  const lintFileName = getLintFileName(testFileName, testDirectoryName);
  checkRule(Rule, lintFileName, ruleArguments);
}

function checkRule(Rule: any, lintFileName: string, ruleArguments: any[]) {
  const source = fs.readFileSync(lintFileName, "utf-8");
  const { errors: actualErrors, secondaryLocations: actualSecondaryLocations } = runRuleOnFile(
    Rule,
    lintFileName,
    ruleArguments,
  );
  const { errors: expectedErrors, secondaryLocations: expectedSecondaryLocations } = parseErrorsFromMarkup(source);

  actualErrors.sort(byLine);
  expectedErrors.sort(byLine);

  expect(actualErrors).toEqual(expectedErrors);
  expectedSecondaryLocations.forEach(expectedSecodaryLocation => {
    expect(actualSecondaryLocations).toContainEqual(expectedSecodaryLocation);
  });
}

function byLine(e1: LintError | SecondaryLocation, e2: LintError | SecondaryLocation) {
  return e1.startPos.line - e2.startPos.line;
}

// used for unit test
function runRuleOnFile(Rule: any, file: string, ruleArguments: any[]) {
  const rule = new Rule(RULE_OPTIONS);
  rule.ruleArguments = ruleArguments;
  const source = fs.readFileSync(file, "utf-8");

  let failures: tslint.RuleFailure[];

  if ((rule as tslint.Rules.TypedRule).applyWithProgram) {
    const result = parseFile(file);
    failures = rule.applyWithProgram(result.sourceFile, result.program);
  } else {
    failures = rule.apply(parseString(source).sourceFile);
  }

  return { errors: mapToLintErrors(failures), secondaryLocations: mapToSecondaryLocations(failures) };
}

function parseErrorsFromMarkup(source: string) {
  const errors: LintError[] = [];
  const secondaryLocations: SecondaryLocation[] = [];

  source.split("\n").forEach((line, lineNum) => {
    if (/\^\s*{{/.test(line)) {
      const startColumn = line.indexOf("^");
      const endColumn = line.lastIndexOf("^") + 1;
      const messageGroup = line.match(/\{\{(.+)\}\}/);
      if (!messageGroup || messageGroup.length < 2) {
        throw new Error(`Unable to read expected issue message at line ${lineNum}`);
      }
      const message = messageGroup[1];
      const costMatch = line.match(/\[\[cost:(\d+)\]\]/);
      const cost = costMatch ? +costMatch[1] : undefined;
      // "- 1" because comment with error description is placed on the next line after error.
      const errorLine = lineNumberedFromOne(lineNum - 1);

      errors.push({
        endPos: { col: endColumn, line: errorLine },
        message,
        cost,
        startPos: { col: startColumn, line: errorLine },
      });
    }

    if (/\^\s*[<>]\s*{{/.test(line)) {
      const startColumn = line.indexOf("^");
      const endColumn = line.lastIndexOf("^") + 1;
      const messageMatch = line.match(/\{\{(.+)\}\}/);
      const message = messageMatch ? messageMatch[1] : undefined;

      // "- 1" because comment with error description is placed on the next line after error.
      const errorLine = lineNumberedFromOne(lineNum - 1);

      secondaryLocations.push({
        endPos: { col: endColumn, line: errorLine },
        message,
        startPos: { col: startColumn, line: errorLine },
      });
    }

    const multiLineMatch = line.match(/\[(\d+):(\d+)-(\d+):(\d+)\]\s*{{/);
    if (multiLineMatch) {
      const startLine = Number(multiLineMatch[1]);
      const startColumn = Number(multiLineMatch[2]);
      const endLine = Number(multiLineMatch[3]);
      const endColumn = Number(multiLineMatch[4]);
      const message = line.match(/\{\{(.+)\}\}/)[1];

      errors.push({
        endPos: { col: endColumn, line: endLine },
        message,
        startPos: { col: startColumn, line: startLine },
      });
    }

    const multiLineSecondaryMatch = line.match(/\[(\d+):(\d+)-(\d+):(\d+)\]\s*[<>]\s*/);
    if (multiLineSecondaryMatch) {
      const startLine = Number(multiLineSecondaryMatch[1]);
      const startColumn = Number(multiLineSecondaryMatch[2]);
      const endLine = Number(multiLineSecondaryMatch[3]);
      const endColumn = Number(multiLineSecondaryMatch[4]);
      const messageMatch = line.match(/\{\{(.+)\}\}/);
      const message = messageMatch ? messageMatch[1] : undefined;

      secondaryLocations.push({
        startPos: { col: startColumn, line: startLine },
        endPos: { col: endColumn, line: endLine },
        message,
      });
    }
  });

  return { errors, secondaryLocations };
}

function getLintFileName(testFileName: string, testDirectoryName?: string): string {
  const baseName = path.basename(testFileName, ".test.ts");
  const testDir = testDirectoryName ? testDirectoryName : baseName;
  for (const ext of ["ts", "tsx"]) {
    const file = path.join(__dirname, `./rules/${testDir}/${baseName}.lint.${ext}`);
    if (fs.existsSync(file)) {
      return file;
    }
  }
  throw new Error(`No lint file found for ${testFileName}`);
}

function mapToLintErrors(failures: tslint.RuleFailure[]): LintError[] {
  return failures.map(failure => {
    const startPosition = failure.getStartPosition().getLineAndCharacter();
    const endPosition = failure.getEndPosition().getLineAndCharacter();
    const cost = isSonarIssue(failure) ? failure.getCost() : undefined;
    return {
      endPos: { col: endPosition.character, line: lineNumberedFromOne(endPosition.line) },
      message: failure.getFailure(),
      cost,
      startPos: { col: startPosition.character, line: lineNumberedFromOne(startPosition.line) },
    };
  });
}

function mapToSecondaryLocations(failures: tslint.RuleFailure[]) {
  const secondaryLocations: SecondaryLocation[] = [];
  failures.forEach(failure => {
    if (isSonarIssue(failure)) {
      secondaryLocations.push(
        ...failure.getSecondaryLocations().map(location => ({
          startPos: { line: lineNumberedFromOne(location.startLine), col: location.startColumn },
          endPos: { line: lineNumberedFromOne(location.endLine), col: location.endColumn },
          message: location.message,
        })),
      );
    }
  });
  return secondaryLocations;
}

function isSonarIssue(failure: tslint.RuleFailure): failure is SonarIssue {
  return "secondaryLocations" in failure;
}

function lineNumberedFromOne(lineNumberedFromZero: number) {
  return lineNumberedFromZero + 1;
}
