//// [functionWithDefaultParameterWithNoStatements13.ts]
var v: any[];

function foo(a = [1 + 1]) { }

function bar(a = [1 + 1]) {
}

//// [functionWithDefaultParameterWithNoStatements13.js]
var v;
function foo(a) {
    if (a === void 0) { a = [1 + 1]; }
}
function bar(a) {
    if (a === void 0) { a = [1 + 1]; }
}
