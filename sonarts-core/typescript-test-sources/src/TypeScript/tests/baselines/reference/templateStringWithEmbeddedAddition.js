//// [templateStringWithEmbeddedAddition.ts]
var x = `abc${ 10 + 10 }def`;

//// [templateStringWithEmbeddedAddition.js]
var x = "abc" + (10 + 10) + "def";
