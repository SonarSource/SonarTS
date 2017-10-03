/// <reference path='fourslash.ts' />

// Should give completions for all dependencies in package.json

// @Filename: tests/test0.ts
//// import * as foo1 from "m/*import_as0*/
//// import foo2 = require("m/*import_equals0*/
//// var foo3 = require("m/*require0*/

// @Filename: package.json
//// {
////     "dependencies": { "module": "latest" },
////     "devDependencies": { "dev-module": "latest" },
////     "optionalDependencies": { "optional-module": "latest" },
////     "peerDependencies": { "peer-module": "latest" }
//// }

const kinds = ["import_as", "import_equals", "require"];

for (const kind of kinds) {
    goTo.marker(kind + "0");

    verify.completionListContains("module");
    verify.completionListContains("dev-module");
    verify.completionListContains("optional-module");
    verify.completionListContains("peer-module");
    verify.not.completionListItemsCountIsGreaterThan(4);
}
