//// [templateStringWithEmbeddedFunctionExpression.ts]
var x = `abc${ function y() { return y; } }def`;

//// [templateStringWithEmbeddedFunctionExpression.js]
var x = "abc" + function y() { return y; } + "def";
