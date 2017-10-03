//// [tests/cases/compiler/elidingImportNames.ts] ////

//// [elidingImportNames_test.ts]
import a = require('./elidingImportNames_main'); // alias used in typeof
var b = a;
var x: typeof a;
import a2 = require('./elidingImportNames_main1'); // alias not used in typeof
var b2 = a2;


//// [elidingImportNames_main.ts]
export var main = 10;

//// [elidingImportNames_main1.ts]
export var main = 10;

//// [elidingImportNames_main.js]
"use strict";
exports.__esModule = true;
exports.main = 10;
//// [elidingImportNames_main1.js]
"use strict";
exports.__esModule = true;
exports.main = 10;
//// [elidingImportNames_test.js]
"use strict";
exports.__esModule = true;
var a = require("./elidingImportNames_main"); // alias used in typeof
var b = a;
var x;
var a2 = require("./elidingImportNames_main1"); // alias not used in typeof
var b2 = a2;
