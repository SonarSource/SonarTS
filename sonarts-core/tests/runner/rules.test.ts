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
import { getIssues } from "../../src/runner/rules";
import { parseString } from "../../src/utils/parser";

it("should run sonarts rules", () => {
  const sampleFile = path.join(__dirname, "./fixtures/runner_project/identical_expressions_and_deadstore.lint.ts");
  const tsconfig = path.join(__dirname, "./fixtures/runner_project/tsconfig.json");
  const program = tslint.Linter.createProgram(tsconfig);

  const issues = getIssues(
    [{ ruleName: "no-identical-expressions", ruleArguments: true }, { ruleName: "no-dead-store", ruleArguments: true }],
    program,
    program.getSourceFile(sampleFile),
  );
  expect(issues.issues.length).toBe(2);
});
