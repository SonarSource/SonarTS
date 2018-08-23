
/// <reference lib="./module-name-long" />
/// <reference lib="./module-name-long" />
/// <reference lib="./module-name-long" />
/// <reference lib="./module-name-long" />

// taken from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
import defaultExport from "module-name-long";
import defaultExport from "module-name-long";
import defaultExport from "module-name-long";
import defaultExport from "module-name-long";

import * as name from "module-name-long";
import * as name from "module-name-long";
import * as name from "module-name-long";
import * as name from "module-name-long";

import { export1 } from "module-name-long";
import { export2 } from "module-name-long";
import { export3 } from "module-name-long";

import { export1 as alias1 } from "module-name-long";
import { export1 as alias2 } from "module-name-long";
import { export1 as alias3 } from "module-name-long";

import defaultExport1, { export12 } from "module-name-long";
import defaultExport2, { export12 } from "module-name-long";
import defaultExport3, { export12 } from "module-name-long";

import defaultExport11, * as name from "module-name-long";
import defaultExport12, * as name from "module-name-long";
import defaultExport13, * as name from "module-name-long";

import "module-name-long";
import "module-name-long";
import "module-name-long";

import a1 = require("module-name-long")
import a1 = require("module-name-long")
import a3 = require("module-name-long")

/* todo should be tested?
var promise1 = import("module-name-long");
var promise2 = import("module-name-long");
var promise3 = import("module-name-long");
*/
export * from "module-name-long";
export * from "module-name-long";
export * from "module-name-long";

export {a} from "module-name-long";
export {b} from "module-name-long";
export {c} from "module-name-long";

// too small
console.log("a&b");
console.log("a&b");
console.log("a&b");

console.log("only 2 times");
console.log("only 2 times");

// no separators
console.log("stringstring");
console.log("stringstring");
console.log("stringstring");
console.log("stringstring");

console.log("some message");
//          ^^^^^^^^^^^^^^ {{Define a constant instead of duplicating this literal 3 times.}} [[cost:2]]
console.log("some message");
//          ^^^^^^^^^^^^^^ < {{Duplicate}}
console.log('some message');
//          ^^^^^^^^^^^^^^ < {{Duplicate}}


function ignoreReactAttributes() {
  <Foo bar="some string"></Foo>;
  <Foo bar="some string"></Foo>;
  <Foo bar="some string"></Foo>;

  <Foo className="some-string"></Foo>;
  let x = "some-string", y = "some-string", z = "some-string";
//        ^^^^^^^^^^^^^ {{Define a constant instead of duplicating this literal 3 times.}} [[cost:2]]
}
