//// [importDeclWithDeclareModifier.ts]
module x {
    interface c {
    }
}
declare export import a = x.c;
var b: a;


//// [importDeclWithDeclareModifier.js]
"use strict";
exports.__esModule = true;
exports.a = x.c;
var b;
