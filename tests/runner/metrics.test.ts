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
import getMetrics from "../../src/runner/metrics";
import { parseString } from "../../src/utils/parser";

it("should return lines of code and comment lines", () => {
  const result = actual(
  `/*
  * header comment is ignored
  */
  class /*after first token*/ A {

     get b() { // comment
       return \`hello
        world\`;
     }
     // comment
  }
  /* multi
  line
  comment */
  `,
  );
  expect(result.ncloc).toEqual([4, 6, 7, 8, 9, 11]);
  expect(result.commentLines).toEqual([4, 6, 10, 12, 13, 14]);
});

it("should return NOSONAR lines", () => {
  const result = actual(
  `x; // NoSonar foo
  y; /* NOSONAR */
  // NOSONAR

  z; // NOOOSONAR
  z; // some comment
  `,
  );
  expect(result.nosonarLines).toEqual([1, 2, 3]);
});

it("should count classes", () => {
  const result = actual(
  `class A { // 1
    foo() {
      return class {}; // 2
    }
  }`);
  expect(result.classes).toEqual(2);
});

it("should count functions", () => {
  const result = actual(
  `class A {
    foo() { // 1
      return function(){};// 2
    }
    get x() { // don't count
      return 42;
    }
  }
  function bar(){ // 3
    return ()=>42; // 4
  }
  function * gen(){} // 5`);
  expect(result.functions).toEqual(5);
});

it("should count statements", () => {
  const result = actual(
  `
  let x = 42; // 1
  ; // 2
  foo(); // 3
  if (x) {} // 4
  while(x) break // 5 + 6
  function foo() {
    debugger; // 7
    return;   // 8
  }
  try { // 9
    do{} while (x); // 10
  } catch (e) {}
  finally {}
  `);
  expect(result.statements).toEqual(10);
});

function actual(content: string): any {
  const sourceFile = parseString(content);
  return getMetrics(sourceFile);
}
