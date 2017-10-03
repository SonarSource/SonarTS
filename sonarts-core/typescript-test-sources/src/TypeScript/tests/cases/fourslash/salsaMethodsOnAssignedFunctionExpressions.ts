/// <reference path="fourslash.ts" />
// @allowJs: true
// @Filename: something.js
////var C = function () { }
/////**
//// * The prototype method.
//// * @param {string} a Parameter definition.
//// */
////function f(a) {}
////C.prototype.m = f;
////
////var x = new C();
////x/*1*/./*2*/m();

verify.quickInfoAt("1", "var x: {\n    m: (a: string) => void;\n}");
goTo.marker('2');
verify.completionListContains('m', '(property) C.m: (a: string) => void', 'The prototype method.');
