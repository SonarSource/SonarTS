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
import * as glob from "glob";
import * as path from "path";
import * as tslint from "tslint";
import * as ts from "typescript";

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
}

export interface RuleRunResult {
  actualErrors: LintError[];
  expectedErrors: LintError[];
}

/**
 * Run rule againts a lint file
 * Use from the test: runRule(Rule, __filename) if lint file name matches the test file name
 */
export function runRule(Rule: any, testFileName: string): RuleRunResult {
  const lintFileName = getLintFileName(testFileName);
  const source = fs.readFileSync(lintFileName, "utf-8");
  const actualErrors = runRuleOnFile(Rule, lintFileName);
  const expectedErrors = parseErrorsFromMarkup(source);
  return { actualErrors, expectedErrors };
}

export function runRuleOnRuling(Rule: any): string[] {
  const snapshot = [];
  const tsconfigPaths = path.join(__dirname, "../typescript-test-sources/src") + "/**/tsconfig.json";
  const tsconfigFiles = glob.sync(tsconfigPaths);

  tsconfigFiles.sort();
  tsconfigFiles.forEach((tsconfigFileName: string) => runRuleOnProject(Rule, tsconfigFileName, snapshot));
  return snapshot;
}

// used for unit test
function runRuleOnFile(Rule: any, file: string): LintError[] {
  const rule = new Rule(RULE_OPTIONS);
  const source = fs.readFileSync(file, "utf-8");

  let failures: tslint.RuleFailure[];

  if ((rule as tslint.Rules.TypedRule).applyWithProgram) {
    const program = ts.createProgram([file], ts.getDefaultCompilerOptions());
    failures = rule.applyWithProgram(program.getSourceFile(file), program);

  } else {
    failures = rule.apply(tslint.getSourceFile(file, source));
  }

  return mapToLintErrors(failures);
}

// used for ruling test
function runRuleOnProject(Rule: any, tsconfigFileName: string, snapshot: string[]): void {
  const program = tslint.Linter.createProgram(tsconfigFileName);
  program.getSourceFiles().forEach((sourceFile) => {
    if (!sourceFile.isDeclarationFile) {
      const actualErrors = runRuleOnProjectFile(Rule, sourceFile, program);
      if (actualErrors.length > 0) {
        const file = getFileNameForSnapshot(sourceFile.fileName);
        const lines = actualErrors.map((error) => error.startPos.line).join();
        snapshot.push(`${file}: ${lines}`);
      }
    }
  });
}

// used for ruling test
function runRuleOnProjectFile(Rule: any, sourceFile: ts.SourceFile, program: ts.Program) {
  const rule = new Rule(RULE_OPTIONS);
  let failures: tslint.RuleFailure[];

  if ((rule as tslint.Rules.TypedRule).applyWithProgram) {
    failures = rule.applyWithProgram(sourceFile, program);

  } else {
    failures = rule.apply(sourceFile);
  }

  return mapToLintErrors(failures);
}

function parseErrorsFromMarkup(source: string): LintError[] {
  const errors = [];

  source.split("\n").forEach((line, lineNum) => {
    if (/\^.*{{/.test(line)) {
      const startColumn = line.indexOf("^");
      const endColumn = line.lastIndexOf("^") + 1;
      const message = line.match(/\{\{(.+)\}\}/)[1];

      // "- 1" because comment with error description is placed on the next line after error.
      const errorLine = lineNumberedFromOne(lineNum - 1);

      errors.push({
        endPos: { col: endColumn, line: errorLine },
        message,
        startPos: { col: startColumn, line: errorLine },
      });
    }
  });

  return errors;
}

function getLintFileName(testFileName: string) {
  const baseName = path.basename(testFileName, ".test.ts");
  return path.join(__dirname, `./rules/${baseName}/${baseName}.lint.ts`);
}

function mapToLintErrors(failures: tslint.RuleFailure[]): LintError[] {
  return failures.map((failure) => {
    const startPosition = failure.getStartPosition().getLineAndCharacter();
    const endPosition = failure.getEndPosition().getLineAndCharacter();
    return {
      endPos: { col: endPosition.character, line: lineNumberedFromOne(endPosition.line) },
      message: failure.getFailure(),
      startPos: { col: startPosition.character, line: lineNumberedFromOne(startPosition.line) },
    };
  });
}

function lineNumberedFromOne(lineNumberedFromZero: number) {
  return lineNumberedFromZero + 1;
}

function getFileNameForSnapshot(path: string) {
  const marker = "/typescript-test-sources/";
  const pos = path.indexOf(marker);
  return path.substr(pos + marker.length);
}
