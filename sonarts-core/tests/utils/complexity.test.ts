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
import { parseString } from "../../src/utils/parser";
import { getOverallComplexity } from "../../src/utils/complexity";

it("should count complexity not skipping functions", () => {
  const sourceFile = parseString(
    `
    1 && 2; // +1
    function foo() { 1 || 2; } // +2
    `,
  );
  const fileComplexityNodes = getOverallComplexity(sourceFile);

  expect(fileComplexityNodes.length).toEqual(3);
  expect(fileComplexityNodes.map(node => node.getText())).toEqual(["&&", "function", "||"]);
});
