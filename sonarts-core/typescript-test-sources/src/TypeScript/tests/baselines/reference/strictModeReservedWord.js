//// [strictModeReservedWord.ts]
let let = 10;

function foo() {
    "use strict"
    var public = 10;
    var static = "hi";
    let let = "blah";
    var package = "hello"
    function package() { }
    function bar(private, implements, let) { }
    function baz<implements, protected>() { }
    function barn(cb: (private, public, package) => void) { }
    barn((private, public, package) => { });

    var myClass = class package extends public {}

    var b: public.bar;

    function foo(x: private.x) { }
    function foo1(x: private.package.x) { }
    function foo2(x: private.package.protected) { }
    let b: interface.package.implements.B;
    ublic();
    static();
}



//// [strictModeReservedWord.js]
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var let = 10;
function foo() {
    "use strict";
    var public = 10;
    var static = "hi";
    var let = "blah";
    var package = "hello";
    function package() { }
    function bar(private, implements, let) { }
    function baz() { }
    function barn(cb) { }
    barn(function (private, public, package) { });
    var myClass = (function (_super) {
        __extends(package, _super);
        function package() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return package;
    }(public));
    var b;
    function foo(x) { }
    function foo1(x) { }
    function foo2(x) { }
    var b;
    ublic();
    static();
}
