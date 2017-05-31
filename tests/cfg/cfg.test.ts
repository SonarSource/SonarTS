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
import * as tslint from "tslint";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";

it("empty file", () => {
  expect(buildVisFromSource("")).toMatchSnapshot();
});

it("literals", () => {
  expect(buildVisFromSource("'literal'")).toMatchSnapshot();
  expect(buildVisFromSource("1")).toMatchSnapshot();
});

it("identifier expression", () => {
  expect(buildVisFromSource("a;")).toMatchSnapshot();
});

it("call expression", () => {
  expect(buildVisFromSource("a();")).toMatchSnapshot();
});

it("call expression with parameters", () => {
  expect(buildVisFromSource("a(b);")).toMatchSnapshot();
  expect(buildVisFromSource("a(b, c);")).toMatchSnapshot();
});

it("assignment", () => {
  expect(buildVisFromSource("x = 'something'")).toMatchSnapshot();
});

it("conditional expression", () => {
  expect(buildVisFromSource("a ? b : c")).toMatchSnapshot();
});

it("assignment of conditional expression", () => {
  expect(buildVisFromSource("a = b ? c : d")).toMatchSnapshot();
});

it("if statement", () => {
  expect(buildVisFromSource("if (a) b")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } c")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } else { c }")).toMatchSnapshot();
});

it("block", () => {
  expect(buildVisFromSource("{a;b;c;}")).toMatchSnapshot();
});

it("for loop", () => {
  expect(buildVisFromSource("for(;x;) {a;}")).toMatchSnapshot();
});

it("complete for loop", () => {
  expect(buildVisFromSource("for(x=0;x=true;x=1) {a;}")).toMatchSnapshot();
});

it("infinite for loop", () => {
  expect(buildVisFromSource("for(;;) {a;}")).toMatchSnapshot();
});

it("while loop", () => {
  expect(buildVisFromSource("while(true) {a;}")).toMatchSnapshot();
});

it("do while loop", () => {
  expect(buildVisFromSource("do {a;} while (true)")).toMatchSnapshot();
});

it("switch", () => {
  expect(buildVisFromSource("switch(k) { case 1: 'one'; case 2: 'two'; }")).toMatchSnapshot();
});

it("switch with default", () => {
  expect(buildVisFromSource("switch(k) { case 1: 'one'; default: 'def'; }")).toMatchSnapshot();
});

it("return", () => {
  expect(buildVisFromSource("if(a) { return true; } b;")).toMatchSnapshot();
});

it("&&", () => {
  expect(buildVisFromSource("if(a && b) { c; } d;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a && b;")).toMatchSnapshot();
});

it("parenthesized", () => {
  expect(buildVisFromSource("r = a < (b && c)")).toMatchSnapshot();
  expect(buildVisFromSource("if(a < (b && c)) { d; } e;")).toMatchSnapshot();
});

it("||", () => {
  expect(buildVisFromSource("r = a || b")).toMatchSnapshot();
  expect(buildVisFromSource("if(a || b) { c; }")).toMatchSnapshot();
});

it("complex conditional", () => {
  expect(buildVisFromSource("r = (a || b) && c;")).toMatchSnapshot();
  expect(buildVisFromSource("if((a || b) && c) { d; }")).toMatchSnapshot();
  expect(buildVisFromSource("if((a && (b || (c)))) { d; }")).toMatchSnapshot();
});

it("simple binary operators", () => {
  expect(buildVisFromSource("r = a < b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a <= b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a > b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a >= b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a == b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a === b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a != b;")).toMatchSnapshot();
  expect(buildVisFromSource("r = a !== b;")).toMatchSnapshot();
});

it("should not forget successors of branching nodes", () => {
  expect(buildVisFromSource("if (a) { b } else if (c) { d }")).toMatchSnapshot();
});

function buildVisFromSource(source: string) {
  const sourceFile = tslint.getSourceFile("", source);
  const cfg = ControlFlowGraph.fromSource(sourceFile.statements);
  return takeData(toVis(cfg));
}

function takeSingleLabel(data: VisData) {
  return data.nodes.get(0).label;
}

function takeData(data: VisData) {
  return {
    nodes: data.nodes.get(),
    edges: data.edges ? data.edges.get() : null,
  };
}
