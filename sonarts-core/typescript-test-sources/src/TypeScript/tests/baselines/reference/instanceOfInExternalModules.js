//// [tests/cases/compiler/instanceOfInExternalModules.ts] ////

//// [instanceOfInExternalModules_require.ts]
export class Foo { foo: string; }

//// [instanceOfInExternalModules_1.ts]
///<reference path='instanceOfInExternalModules_require.ts'/>
import Bar = require("instanceOfInExternalModules_require");
function IsFoo(value: any): boolean {
    return value instanceof Bar.Foo;
}


//// [instanceOfInExternalModules_require.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Foo = (function () {
        function Foo() {
        }
        return Foo;
    }());
    exports.Foo = Foo;
});
//// [instanceOfInExternalModules_1.js]
define(["require", "exports", "instanceOfInExternalModules_require"], function (require, exports, Bar) {
    "use strict";
    exports.__esModule = true;
    function IsFoo(value) {
        return value instanceof Bar.Foo;
    }
});
