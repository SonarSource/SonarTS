//// [templateStringWithEmbeddedMultiplication.ts]
var x = `abc${ 7 * 6 }def`;

//// [templateStringWithEmbeddedMultiplication.js]
var x = "abc" + 7 * 6 + "def";
