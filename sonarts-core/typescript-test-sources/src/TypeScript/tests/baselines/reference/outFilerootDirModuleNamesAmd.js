//// [tests/cases/conformance/es6/moduleExportsAmd/outFilerootDirModuleNamesAmd.ts] ////

//// [a.ts]
import foo from "./b";
export default class Foo {}
foo();

//// [b.ts]
import Foo from "./a";
export default function foo() { new Foo(); }


//// [output.js]
define("b", ["require", "exports", "a"], function (require, exports, a_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function foo() { new a_1.default(); }
    exports.default = foo;
});
define("a", ["require", "exports", "b"], function (require, exports, b_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Foo {
    }
    exports.default = Foo;
    b_1.default();
});
