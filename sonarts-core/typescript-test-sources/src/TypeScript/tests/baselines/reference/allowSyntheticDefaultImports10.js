//// [tests/cases/compiler/allowSyntheticDefaultImports10.ts] ////

//// [b.d.ts]
export function foo();

export function bar();

//// [a.ts]
import Foo = require("./b");
Foo.default.bar();
Foo.default.default.foo();

//// [a.js]
"use strict";
exports.__esModule = true;
var Foo = require("./b");
Foo["default"].bar();
Foo["default"]["default"].foo();
