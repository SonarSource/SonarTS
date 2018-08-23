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
import * as path from "path";
import { processRequest } from "../../src/runner/processRequest";

it("should process full input", () => {
  const filepath = path.join(__dirname, "./fixtures/runnerProject/sample.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/runnerProject/tsconfig.json");
  const result = processRequest(inputForRequest(filepath, tsconfig));
  result.forEach((r: any) => r.issues.forEach((i: any) => (i.name = path.normalize(i.name))));

  expect(result).toEqual([
    {
      filepath,
      issues: [
        {
          failure: "block is empty",
          startPosition: { line: 0, character: 12, position: 12 },
          endPosition: { line: 0, character: 14, position: 14 },
          name: path.normalize(filepath),
          ruleName: "no-empty",
          fix: undefined,
          ruleSeverity: "ERROR",
        },
      ],
      highlights: [{ startLine: 1, startCol: 0, endLine: 1, endCol: 8, textType: "keyword" }],
      cpdTokens: [
        { startLine: 1, startCol: 0, endLine: 1, endCol: 8, image: "function" },
        { startLine: 1, startCol: 9, endLine: 1, endCol: 10, image: "x" },
        { startLine: 1, startCol: 10, endLine: 1, endCol: 11, image: "(" },
        { startLine: 1, startCol: 11, endLine: 1, endCol: 12, image: ")" },
        { startLine: 1, startCol: 12, endLine: 1, endCol: 13, image: "{" },
        { startLine: 1, startCol: 13, endLine: 1, endCol: 14, image: "}" },
      ],
      symbols: [{ startLine: 1, startCol: 9, endLine: 1, endCol: 10, references: [] }],
      ncloc: [1],
      commentLines: [],
      nosonarLines: [],
      executableLines: [],
      statements: 0,
      functions: 1,
      classes: 0,
      complexity: 1,
      cognitiveComplexity: 0,
    },
  ]);
});

it("should process files with BOM correctly", () => {
  const filepath = path.join(__dirname, "./fixtures/runnerProject/withBOM.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/runnerProject/tsconfig.json");
  const result = processRequest(inputForRequest(filepath, tsconfig));

  const firstCpdToken = result[0].cpdTokens[0];
  const firstSyntaxHighlightingToken = result[0].highlights[0];

  expect(firstCpdToken).toEqual({ startLine: 1, startCol: 0, endLine: 1, endCol: 6, image: "import" });
  expect(firstSyntaxHighlightingToken).toEqual({
    startLine: 1,
    startCol: 0,
    endLine: 1,
    endCol: 6,
    textType: "keyword",
  });
});

it("should report syntax errors", () => {
  const filepath = path.join(__dirname, "./fixtures/syntax-error-project/syntax-error.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/syntax-error-project/tsconfig.json");
  const result = processRequest(inputForRequest(filepath, tsconfig));

  expect(result[0].diagnostics).toEqual([{ col: 0, line: 4, message: "Expression expected." }]);
});

it("should ignore traceResolution property", () => {
  let loggedOutput = "";
  // monkey-patching stdout to test what has been logged
  const stdoutWriteStream = process.stdout.write;
  process.stdout.write = function(chunk: string | Buffer) {
    loggedOutput += chunk.toString();
    return true;
  };
  const filepath = path.join(__dirname, "./fixtures/with-trace-resolution-project/bar.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/with-trace-resolution-project/tsconfig.json");
  const result = processRequest(inputForRequest(filepath, tsconfig));
  expect(loggedOutput).toBe("");
  expect(result[0].issues).toHaveLength(1);
  process.stdout.write = stdoutWriteStream;
});

function inputForRequest(filepath: string, tsconfig: string): string {
  return JSON.stringify({
    filepaths: [path.normalize(filepath)],
    rules: [{ ruleArguments: [], ruleName: "no-empty" }],
    tsconfig: tsconfig,
  });
}
