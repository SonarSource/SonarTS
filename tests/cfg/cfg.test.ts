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
import * as ts from "typescript";
import { ControlFlowGraph } from "../../src/cfg/cfg";
import toVis, { VisData } from "../../src/tools/cfg_viewer/transformer";
import { parseString } from "../../src/utils/parser";

it("empty file", () => {
  expect(buildVisFromSource("")).toMatchSnapshot();
});

// ---- EXPRESSIONS

it("simple literals", () => {
  expect(buildVisFromSource("'literal'")).toMatchSnapshot();
  expect(buildVisFromSource("1")).toMatchSnapshot();
  expect(buildVisFromSource("/ab+c/")).toMatchSnapshot();
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

it("assignment and binary", () => {
  expect(buildVisFromSource("x = 2 + 1")).toMatchSnapshot();
});

it("conditional expression", () => {
  expect(buildVisFromSource("a ? b : c")).toMatchSnapshot();
});

it("assignment of conditional expression", () => {
  expect(buildVisFromSource("a = b ? c : d")).toMatchSnapshot();
});

it("array literal", () => {
  expect(buildVisFromSource("x = [1, 2, foo(), , 3];")).toMatchSnapshot();
});

it("template expression (string literal)", () => {
  expect(buildVisFromSource("x = `foo${foobar1()}bar${foobar2()}`;")).toMatchSnapshot();
});

it("declaration expressions", () => {
  expect(buildVisFromSource("x = function() {foo ();}")).toMatchSnapshot();
  expect(buildVisFromSource("x = (a, b) => {foo();};")).toMatchSnapshot();
  expect(buildVisFromSource("x = class A { foo(){ y } };")).toMatchSnapshot();
});

it("property access", () => {
  expect(buildVisFromSource("x = a.b;")).toMatchSnapshot();
  expect(buildVisFromSource("foo(x ? 1 : 2).bar();")).toMatchSnapshot();
});

it("element access", () => {
  // empty element access, possible theoretically based on ElementAccessExpression tree interface
  expect(buildVisFromSource("x = a[];")).toMatchSnapshot();
  expect(buildVisFromSource("x = a[b];")).toMatchSnapshot();
  expect(buildVisFromSource("foo(x ? 1 : 2)[y ? 3 : 4];")).toMatchSnapshot();
});

it("new expression", () => {
  expect(buildVisFromSource("x = new A;")).toMatchSnapshot();
  expect(buildVisFromSource("x = new A(1, 2);")).toMatchSnapshot();
});

it("tagged template", () => {
  expect(buildVisFromSource("foo`abc ${bar(1, 2)}`")).toMatchSnapshot();
  expect(buildVisFromSource("foo(1, 2)`abc`")).toMatchSnapshot();
});

it("type assertion expression", () => {
  expect(buildVisFromSource("<number>a.foo", ts.ScriptKind.TS)).toMatchSnapshot();
  expect(buildVisFromSource("<foo.bar>a.b", ts.ScriptKind.TS)).toMatchSnapshot();
});

it("delete/typeof/void/await expressions", () => {
  expect(buildVisFromSource("delete a[42]")).toMatchSnapshot();
  expect(buildVisFromSource("typeof foo(1, 2)")).toMatchSnapshot();
  expect(buildVisFromSource("void foo")).toMatchSnapshot();
  expect(buildVisFromSource("await foo(1, 2)")).toMatchSnapshot();
});

it("prefix unary expression", () => {
  expect(buildVisFromSource("--x")).toMatchSnapshot();
  expect(buildVisFromSource("x = +y")).toMatchSnapshot();
});

it("postfix unary expression", () => {
  expect(buildVisFromSource("x++")).toMatchSnapshot();
  expect(buildVisFromSource("x = y--")).toMatchSnapshot();
});

it("'as' expression", () => {
  expect(buildVisFromSource("foo(1, 2) as a.b")).toMatchSnapshot();
});

it("non-null expression", () => {
  expect(buildVisFromSource("foo!")).toMatchSnapshot();
  expect(buildVisFromSource("foo!.bar")).toMatchSnapshot();
});

it("spread element", () => {
  expect(buildVisFromSource("foo(a, ...b)")).toMatchSnapshot();
});

it("metaproperty", () => {
  expect(buildVisFromSource("new.target")).toMatchSnapshot();
});

it("yield expression", () => {
  expect(buildVisFromSource("yield;")).toMatchSnapshot();
  expect(buildVisFromSource("yield 42;")).toMatchSnapshot();
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
  expect(buildVisFromSource("r = a , b;")).toMatchSnapshot();
  expect(buildVisFromSource("r -= b;")).toMatchSnapshot();
  expect(buildVisFromSource("a + b * c - d")).toMatchSnapshot();
});

it("keywords", () => {
  expect(buildVisFromSource("super(); this; null;")).toMatchSnapshot();
});

it("object literal", () => {
  expect(
    buildVisFromSource(`obj = {
    foo() {},
    b : c ? 1 : 2,
    get d() {},
    [x ? 'big':'small'] : 3,
    a
  }`),
  ).toMatchSnapshot();
});

it("object destructuring assignment", () => {
  // "locVarName2 = 42" will appear in CFG while it should not, due to syntax tree representation limit
  expect(
    buildVisFromSource(`({
    a,
    b = (x + y),
    propName1: locVarName1,
    propName2: (locVarName),
    propName3: locVarName2 = 42
  } = obj);`),
  ).toMatchSnapshot();
});

it("jsx tag names", () => {
  expect(buildVisFromSource("<a/>")).toMatchSnapshot();
  expect(buildVisFromSource("<this/>")).toMatchSnapshot();
  expect(buildVisFromSource("<A/>")).toMatchSnapshot();
  expect(buildVisFromSource("<A.b.c/>")).toMatchSnapshot();

  expect(buildVisFromSource("<a></a>")).toMatchSnapshot();
  expect(buildVisFromSource("<A></A>")).toMatchSnapshot();
  expect(buildVisFromSource("<A.b></A.b>")).toMatchSnapshot();
});

it("jsx attributes", () => {
  expect(buildVisFromSource('<a foo="value"/>')).toMatchSnapshot();
  expect(buildVisFromSource("<a {... foo(x ? 1 : 2)}/>")).toMatchSnapshot();
  expect(buildVisFromSource("<a {...x} {...y}/>")).toMatchSnapshot();
  expect(buildVisFromSource("<a b={foo}/>")).toMatchSnapshot();
  expect(buildVisFromSource("<a attr/>")).toMatchSnapshot();
});

it("jsx children", () => {
  expect(buildVisFromSource("<div>hello</div>")).toMatchSnapshot();
  expect(buildVisFromSource("<div>hello {name}</div>")).toMatchSnapshot();
  expect(buildVisFromSource("<div>hello <p {...attr1}></p><a {...attr2}/></div>")).toMatchSnapshot();
});

// ---- STATEMENTS

it("if statement", () => {
  expect(buildVisFromSource("if (a) b")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } c")).toMatchSnapshot();
  expect(buildVisFromSource("if (a) { b } else { c }")).toMatchSnapshot();
});

it("block", () => {
  expect(buildVisFromSource("{a;b;c;}")).toMatchSnapshot();
});

it("for loop", () => {
  expect(buildVisFromSource("let x=0; for(;x;) {a;}")).toMatchSnapshot();
});

it("complete for loop", () => {
  expect(buildVisFromSource("for(x=0;x=true;x=1) {a;}")).toMatchSnapshot();
});

it("infinite for loop", () => {
  expect(buildVisFromSource("for(;;) {a;}")).toMatchSnapshot();
});

it("while loop", () => {
  expect(buildVisFromSource("let x = 0; while(x) {a;}")).toMatchSnapshot();
  expect(buildVisFromSource("while(true) {a;}")).toMatchSnapshot();
});

it("do while loop", () => {
  expect(buildVisFromSource("let x =0; do {a;} while (x)")).toMatchSnapshot();
});

it("for in loop", () => {
  expect(buildVisFromSource("for(let prop in obj) {prop;}")).toMatchSnapshot();
});

it("for of loop", () => {
  expect(buildVisFromSource("for(let x of arr) {x.do();}")).toMatchSnapshot();
});

it("switch without break and defaults", () => {
  expect(buildVisFromSource("switch(a) { case 1: a1; case 2: a2; }")).toMatchSnapshot();
  expect(buildVisFromSource("switch(a) { case 1: case 2: a2; }")).toMatchSnapshot();
  expect(buildVisFromSource("switch(a) { case 1: if (a1) foo; else bar; case 2: a2; }")).toMatchSnapshot();
});

it("switch with default", () => {
  expect(buildVisFromSource("switch(a) { case 1: a1; case 2: a2; default: myDefault; }")).toMatchSnapshot();
  expect(buildVisFromSource("switch(a) { default: myDefault; case 1: a1; case 2: a2; }")).toMatchSnapshot();
  expect(buildVisFromSource("switch(a) { case 1: a1; default: myDefault; case 2: a2; }")).toMatchSnapshot();
  expect(buildVisFromSource("switch(a) { case 1: a1; default:; case 2: a2; }")).toMatchSnapshot();
});

it("return", () => {
  expect(buildVisFromSource("if(a) { return true; } b;")).toMatchSnapshot();
});

it("should not forget successors of branching nodes", () => {
  expect(buildVisFromSource("if (a) { b } else if (c) { d }")).toMatchSnapshot();
});

it("empty statement", () => {
  expect(buildVisFromSource(";")).toMatchSnapshot();
  expect(buildVisFromSource(";a;;")).toMatchSnapshot();
});

it("declarations", () => {
  expect(buildVisFromSource("debugger;")).toMatchSnapshot();
  expect(buildVisFromSource("import {a, b} from 'foo';")).toMatchSnapshot();
  expect(buildVisFromSource("foo(); class A{}")).toMatchSnapshot();
  expect(buildVisFromSource("function foo(){}\nfoo();")).toMatchSnapshot();
});

it("variable statement", () => {
  expect(buildVisFromSource("var x = a < b, y = foo(), z;")).toMatchSnapshot();
  expect(buildVisFromSource("let a:number;")).toMatchSnapshot();
  expect(buildVisFromSource("const {a, b: c, d = foo()} = bar();")).toMatchSnapshot();
  expect(buildVisFromSource("let [a, b,, c = foo()] = bar;")).toMatchSnapshot();
});

it("'with' statement", () => {
  expect(buildVisFromSource("with (a) { foo(); }")).toMatchSnapshot();
});

it("'throw' statement", () => {
  expect(buildVisFromSource("foo(); if (cond) throw bar(); foobar();")).toMatchSnapshot();
});

it("continue statement", () => {
  // while
  expect(buildVisFromSource("let b = x; while(a) { if (b) continue; c}")).toMatchSnapshot();
  expect(buildVisFromSource("foo: while(a) { if (b) continue; c}")).toMatchSnapshot();
  expect(buildVisFromSource("let b = x; foo: while(a) { if (b) continue foo; c}")).toMatchSnapshot();

  // do-while
  expect(buildVisFromSource("do { if (b) continue; c} while (a);")).toMatchSnapshot();
  expect(buildVisFromSource("foo: do { if (b) continue; c} while (a);")).toMatchSnapshot();
  expect(buildVisFromSource("foo: do { if (b) continue foo; c} while (a);")).toMatchSnapshot();

  // for
  expect(buildVisFromSource("for(init; cond; inc) { if(subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("for(init; cond; ) { if(subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("for(init; ; ) { if(subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for(init; cond; inc) { if(subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for(init; cond; inc) { if(subcond) continue foo; stmt; }")).toMatchSnapshot();

  // for-each
  expect(buildVisFromSource("for (elem of obj) { if (subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("let x = 1; foo: for (elem in obj) { if (subcond) continue; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for (elem of obj) { if (subcond) continue foo; stmt; }")).toMatchSnapshot();
});

it("double continue", () => {
  expect(
    buildVisFromSource(`
  outer:while(b) {
   continue outer;
   while (a) {
     continue;
   }
  }`),
  ).toMatchSnapshot();
});

it("break statement", () => {
  // while
  expect(buildVisFromSource("while(a) { if (b) break; c}")).toMatchSnapshot();
  expect(buildVisFromSource("foo: while(a) { if (b) break; c}")).toMatchSnapshot();
  expect(buildVisFromSource("foo: while(a) { if (b) break foo; c}")).toMatchSnapshot();

  // do-while
  expect(buildVisFromSource("do { if (b) break; c} while (a);")).toMatchSnapshot();
  expect(buildVisFromSource("foo: do { if (b) break; c} while (a);")).toMatchSnapshot();
  expect(buildVisFromSource("foo: do { if (b) break foo; c} while (a);")).toMatchSnapshot();

  // for
  expect(buildVisFromSource("for(init; cond; inc) { if(subcond) break; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("for(init; cond; ) { if(subcond) break; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for(init; cond; inc) { if(subcond) break; stmt; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for(init; cond; inc) { if(subcond) break foo; stmt; }")).toMatchSnapshot();

  // for-each
  expect(buildVisFromSource("for (elem in obj) { if (subcond) break; stmt; } ")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for (elem in obj) { if (subcond) break; stmt; } ")).toMatchSnapshot();
  expect(buildVisFromSource("foo: for (elem in obj) { if (subcond) break foo; stmt; } ")).toMatchSnapshot();

  // switch
  expect(buildVisFromSource("switch (a) { case 1: stmt1; break; case 2: stmt2; }")).toMatchSnapshot();
  expect(buildVisFromSource("foo: switch (a) { case 1: stmt1; break; case 2: stmt2; }")).toMatchSnapshot();
  expect(
    buildVisFromSource(`
  foo: switch(a) {
    case 1:
      stmt1; break;
    case 2:
      stmt2;
      bar: switch(b) {
        case 11:
          stmt11; break foo;
        case 12:
          stmt12; break;
        case 13:
          stmt13; break bar;
      }
      stmt21;
    case 3:
      stmt3;
  }`),
  ).toMatchSnapshot();
});

it("labels", () => {
  expect(
    buildVisFromSource(`
  label1:
  while(a1) {
    while(a2) {
      if(b) break label1;
      c;
    }
    d;
  }`),
  ).toMatchSnapshot();

  expect(
    buildVisFromSource(`
  foo:
  while (a) {
    c;
    bar: {
      if (b) continue;
      else break bar;
      e;
    }
    d;
  }`),
  ).toMatchSnapshot();
});

it("mix continue/break statement", () => {
  expect(
    buildVisFromSource(`
  while(a1) {
    while(a2) continue;
    if (b) break;
  }`),
  ).toMatchSnapshot();
});

function buildVisFromSource(source: string, scriptKind: ts.ScriptKind = ts.ScriptKind.TSX) {
  const sourceFile = parseString(source, scriptKind);
  const cfg = ControlFlowGraph.fromStatements(sourceFile.statements);
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
