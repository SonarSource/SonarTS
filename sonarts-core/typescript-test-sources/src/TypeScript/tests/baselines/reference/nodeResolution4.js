//// [tests/cases/compiler/nodeResolution4.ts] ////

//// [ref.ts]
var x = 1;

//// [a.ts]
/// <reference path="ref.ts"/>
export var y;

//// [b.ts]
import y = require("./a");

//// [ref.js]
var x = 1;
//// [a.js]
"use strict";
exports.__esModule = true;
//// [b.js]
"use strict";
exports.__esModule = true;
