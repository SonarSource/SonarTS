//// [templateStringInTypeAssertion.ts]
var x = <any>`abc${ 123 }def`;

//// [templateStringInTypeAssertion.js]
var x = "abc" + 123 + "def";
