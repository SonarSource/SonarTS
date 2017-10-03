//// [tests/cases/compiler/declFileExportAssignmentOfGenericInterface.ts] ////

//// [declFileExportAssignmentOfGenericInterface_0.ts]
interface Foo<T> {
    a: string;
}
export = Foo;

//// [declFileExportAssignmentOfGenericInterface_1.ts]
import a = require('declFileExportAssignmentOfGenericInterface_0');
export var x: a<a<string>>;
x.a;

//// [declFileExportAssignmentOfGenericInterface_0.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//// [declFileExportAssignmentOfGenericInterface_1.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.x.a;
});


//// [declFileExportAssignmentOfGenericInterface_0.d.ts]
interface Foo<T> {
    a: string;
}
export = Foo;
//// [declFileExportAssignmentOfGenericInterface_1.d.ts]
import a = require('declFileExportAssignmentOfGenericInterface_0');
export declare var x: a<a<string>>;
