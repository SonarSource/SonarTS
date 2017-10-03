//// [tests/cases/conformance/ambient/ambientShorthand.ts] ////

//// [declarations.d.ts]
declare module "jquery"
// Semicolon is optional
declare module "fs";

//// [user.ts]
///<reference path="declarations.d.ts"/>
import foo, {bar} from "jquery";
import * as baz from "fs";
import boom = require("jquery");
foo(bar, baz, boom);


//// [user.js]
"use strict";
exports.__esModule = true;
///<reference path="declarations.d.ts"/>
var jquery_1 = require("jquery");
var baz = require("fs");
var boom = require("jquery");
jquery_1["default"](jquery_1.bar, baz, boom);
