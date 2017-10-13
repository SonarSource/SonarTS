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
import * as ts from "typescript";
import { CfgBlock, CfgBlockWithPredecessors, CfgGenericBlock } from "../../src/cfg/cfg";

it("should create simple label", () => {
  const block = new CfgGenericBlock();
  block.addElement({
    getText() {
      return "a";
    },
  } as ts.Node);
  expect(block.getLabel()).toBe("a");
});

it("should create multi-line label", () => {
  const block = new CfgGenericBlock();
  block.addElement({
    getText() {
      return "a";
    },
  } as ts.Node);
  block.addElement({
    getText() {
      return "b";
    },
  } as ts.Node);
  expect(block.getLabel()).toBe("b\na");
});
