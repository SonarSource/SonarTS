//// [nonMergedOverloads.ts]
var f = 10;

export function f();
export function f() {
}

//// [nonMergedOverloads.js]
"use strict";
exports.__esModule = true;
var f = 10;
function f() {
}
exports.f = f;
