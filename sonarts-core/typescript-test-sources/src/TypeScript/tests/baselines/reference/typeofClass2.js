//// [typeofClass2.ts]
class C {
    constructor(x: number);
    constructor(x: string);
    constructor(x) { }

    static foo(x: number);
    static foo(x: C);
    static foo(x) { }

    static bar(x) { }
}

class D extends C {
    static baz(x: number) { }
    foo() { }
}

var d: D;

var r1: typeof D;
var r2: typeof d;

//// [typeofClass2.js]
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
var C = (function () {
    function C(x) {
    }
    C.foo = function (x) { };
    C.bar = function (x) { };
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    D.baz = function (x) { };
    D.prototype.foo = function () { };
    return D;
}(C));
var d;
var r1;
var r2;
