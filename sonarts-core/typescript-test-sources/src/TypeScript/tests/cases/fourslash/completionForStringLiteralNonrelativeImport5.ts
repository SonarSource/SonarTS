/// <reference path='fourslash.ts' />

// Should give completions for ambiently declared modules

// @Filename: test0.ts
//// /// <reference path="./ambientModules.d.ts" />
//// /// <reference path="./ambientModules2.d.ts" />
//// import * as foo1 from "/*import_as0*/
//// import * as foo2 from "a/*import_as1*/

//// import foo3 = require("/*import_equals0*/
//// import foo4 = require("a/*import_equals1*/

//// var foo5 = require("/*require0*/
//// var foo6 = require("a/*require1*/

// @Filename: ambientModules.d.ts
//// declare module "ambientModule" {}
//// declare module "otherAmbientModule" {} /*dummy0*/

// @Filename: ambientModules2.d.ts
//// declare module "otherOtherAmbientModule" {} /*dummy1*/

const kinds = ["import_as", "import_equals", "require"];

for (const kind of kinds) {
    goTo.marker(kind + "0");

    verify.completionListContains("ambientModule");
    verify.completionListContains("otherAmbientModule");
    verify.completionListContains("otherOtherAmbientModule");
    verify.not.completionListItemsCountIsGreaterThan(3);

    goTo.marker(kind + "1");

    verify.completionListContains("ambientModule");
    verify.not.completionListItemsCountIsGreaterThan(1);
}

