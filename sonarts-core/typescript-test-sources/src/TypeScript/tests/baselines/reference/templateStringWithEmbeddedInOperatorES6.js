//// [templateStringWithEmbeddedInOperatorES6.ts]
var x = `abc${ "hi" in { hi: 10, hello: 20} }def`;

//// [templateStringWithEmbeddedInOperatorES6.js]
var x = `abc${"hi" in { hi: 10, hello: 20 }}def`;
