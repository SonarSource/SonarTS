//// [bestCommonTypeOfTuple2.ts]
interface base { }
interface base1 { i }
class C implements base { c }
class D implements base { d }
class E implements base { e }
class F extends C { f }

class C1 implements base1 { i = "foo"; c }
class D1 extends C1 { i = "bar"; d }

var t1: [C, base];
var t2: [C, D];
var t3: [C1, D1];
var t4: [base1, C1];
var t5: [C1, F]

var e11 = t1[4]; // base
var e21 = t2[4]; // {}
var e31 = t3[4]; // C1
var e41 = t4[2]; // base1
var e51 = t5[2]; // {}


//// [bestCommonTypeOfTuple2.js]
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
    }
    return C;
}());
var D = (function () {
    function D() {
    }
    return D;
}());
var E = (function () {
    function E() {
    }
    return E;
}());
var F = (function (_super) {
    __extends(F, _super);
    function F() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return F;
}(C));
var C1 = (function () {
    function C1() {
        this.i = "foo";
    }
    return C1;
}());
var D1 = (function (_super) {
    __extends(D1, _super);
    function D1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.i = "bar";
        return _this;
    }
    return D1;
}(C1));
var t1;
var t2;
var t3;
var t4;
var t5;
var e11 = t1[4]; // base
var e21 = t2[4]; // {}
var e31 = t3[4]; // C1
var e41 = t4[2]; // base1
var e51 = t5[2]; // {}
