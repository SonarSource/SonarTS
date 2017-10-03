/// <reference path='fourslash.ts'/>

// Global interface reference.

// @Filename: referencesForGlobals_1.ts
////declare module "[|{| "isDefinition": true |}foo|]" {
////    var f: number;
////}


// @Filename: referencesForGlobals_2.ts
////import f = require("[|foo|]");

const ranges = test.ranges();
const [r0, r1] = ranges;
verify.referenceGroups(r0, [{ definition: 'module "foo"', ranges }]);
verify.referenceGroups(r1, [{ definition: 'module f', ranges }]);
