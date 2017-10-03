//// [classWithStaticMembers.ts]
class C {
    static fn() { return this; }
    static get x() { return 1; }
    static set x(v) { }
    constructor(public a: number, private b: number) { }
    static foo: string; 
}

var r = C.fn();
var r2 = r.x;
var r3 = r.foo;

class D extends C {
    bar: string;
}

var r = D.fn();
var r2 = r.x;
var r3 = r.foo;

//// [classWithStaticMembers.js]
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
    function C(a, b) {
        this.a = a;
        this.b = b;
    }
    C.fn = function () { return this; };
    Object.defineProperty(C, "x", {
        get: function () { return 1; },
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
var r = C.fn();
var r2 = r.x;
var r3 = r.foo;
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
var r = D.fn();
var r2 = r.x;
var r3 = r.foo;
