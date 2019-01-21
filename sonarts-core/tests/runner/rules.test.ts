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
import * as path from "path";
import { getIssues } from "../../src/runner/rules";
import { createProgram } from "../../src/utils/parser";

it("should run sonarts rules", () => {
  const sampleFile = path.join(__dirname, "./fixtures/runnerProject/identicalExpressionsAnDeadstore.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/runnerProject/tsconfig.json");
  const program = createProgram(tsconfig, path.join(__dirname, "./fixtures/runnerProject"));

  const issues = getIssues(
    [
      { ruleName: "no-identical-expressions", ruleArguments: [], ruleSeverity: "error", disabledIntervals: [] },
      { ruleName: "no-dead-store", ruleArguments: [], ruleSeverity: "error", disabledIntervals: [] },
    ],
    program,
    program.getSourceFile(sampleFile),
  );
  expect(issues.issues.length).toBe(2);
  expect("secondaryLocations" in issues.issues[0]).toBeTruthy();
});
