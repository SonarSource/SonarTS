//// [restElementWithAssignmentPattern4.ts]
var a: string, b: number;
var tuple: [string, number] = ["", 1];
[...{ 0: a = "", b }] = tuple;

//// [restElementWithAssignmentPattern4.js]
var a, b;
var tuple = ["", 1];
_a = tuple.slice(0), _b = _a[0], a = _b === void 0 ? "" : _b, b = _a.b;
var _a, _b;
