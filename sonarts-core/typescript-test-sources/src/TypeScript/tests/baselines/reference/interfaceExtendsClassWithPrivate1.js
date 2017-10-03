//// [interfaceExtendsClassWithPrivate1.ts]
class C {
    public foo(x: any) { return x; }
    private x = 1;
}

interface I extends C {
    other(x: any): any;
}

class D extends C implements I {
    public foo(x: any) { return x; }
    other(x: any) { return x; }
    bar() { }
} 

var c: C;
var i: I;
var d: D;

c = i;
i = c; // error

i = d;
d = i; // error

c = d;
d = c; // error

//// [interfaceExtendsClassWithPrivate1.js]
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
    function C() {
        this.x = 1;
    }
    C.prototype.foo = function (x) { return x; };
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    D.prototype.foo = function (x) { return x; };
    D.prototype.other = function (x) { return x; };
    D.prototype.bar = function () { };
    return D;
}(C));
var c;
var i;
var d;
c = i;
i = c; // error
i = d;
d = i; // error
c = d;
d = c; // error
