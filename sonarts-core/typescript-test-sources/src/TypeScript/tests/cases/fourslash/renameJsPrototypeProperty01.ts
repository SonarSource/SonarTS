/// <reference path='fourslash.ts'/>

// @allowJs: true
// @Filename: a.js
////function bar() {
////}
////bar.prototype.[|x|] = 10;
////var t = new bar();
////t.[|x|] = 11;

verify.rangesAreRenameLocations();
