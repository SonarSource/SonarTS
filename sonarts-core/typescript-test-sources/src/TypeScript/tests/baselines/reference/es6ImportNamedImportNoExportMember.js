//// [tests/cases/compiler/es6ImportNamedImportNoExportMember.ts] ////

//// [es6ImportNamedImportNoExportMember_0.ts]
export var a = 10;
export var x = a;

//// [es6ImportNamedImport_1.ts]
import { a1 } from "./es6ImportNamedImportNoExportMember_0";
import { x1 as x } from "./es6ImportNamedImportNoExportMember_0";

//// [es6ImportNamedImportNoExportMember_0.js]
"use strict";
exports.__esModule = true;
exports.a = 10;
exports.x = exports.a;
//// [es6ImportNamedImport_1.js]
"use strict";
exports.__esModule = true;
