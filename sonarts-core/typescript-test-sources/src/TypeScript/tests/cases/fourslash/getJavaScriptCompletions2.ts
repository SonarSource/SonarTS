///<reference path="fourslash.ts" />

// @allowNonTsExtensions: true
// @Filename: Foo.js
/////** @type {(number|string)} */
////var v;
////v./**/

goTo.marker();
verify.completionListContains("valueOf", /*displayText:*/ undefined, /*documentation*/ undefined, "method");