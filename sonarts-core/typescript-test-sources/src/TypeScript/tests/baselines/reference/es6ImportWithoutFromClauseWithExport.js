//// [tests/cases/compiler/es6ImportWithoutFromClauseWithExport.ts] ////

//// [server.ts]
export var a = 10;

//// [client.ts]
export import "server";

//// [server.js]
"use strict";
exports.__esModule = true;
exports.a = 10;
//// [client.js]
"use strict";
exports.__esModule = true;
require("server");


//// [server.d.ts]
export declare var a: number;
//// [client.d.ts]
export import "server";
