

// taken from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
import defaultExport1 from "module-name-long";
import defaultExport2 from "module-name-long";
import defaultExport3 from "module-name-long";

import * as name1 from "module-name-long";
import * as name2 from "module-name-long";
import * as name3 from "module-name-long";

import { export1 } from "module-name-long";
import { export2 } from "module-name-long";
import { export3 } from "module-name-long";

import { export1 as alias1 } from "module-name-long";
import { export1 as alias2 } from "module-name-long";
import { export1 as alias3 } from "module-name-long";

import "module-name-long";
import "module-name-long";
import "module-name-long";

import a1 = require("module-name-long")
import a2 = require("module-name-long")
import a3 = require("module-name-long")

export * from "module-name-long";
export * from "module-name-long";
export * from "module-name-long";

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
