/// <reference path='fourslash.ts' />

////// should NOT see a and b
////foo((a, b) => (a,/*1*/

goTo.marker("1");
verify.completionListContains("a");
verify.completionListContains("b");