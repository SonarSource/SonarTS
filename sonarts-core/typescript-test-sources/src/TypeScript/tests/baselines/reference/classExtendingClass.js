//// [classExtendingClass.ts]
class C {
    foo: string;
    thing() { }
    static other() { }
}

class D extends C {
    bar: string;
}

var d: D;
var r = d.foo;
var r2 = d.bar;
var r3 = d.thing();
var r4 = D.other();

class C2<T> {
    foo: T;
    thing(x: T) { }
    static other<T>(x: T) { }
}

class D2<T> extends C2<T> {
    bar: string;
}

var d2: D2<string>;
var r5 = d2.foo;
var r6 = d2.bar;
var r7 = d2.thing('');
var r8 = D2.other(1);

//// [classExtendingClass.js]
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
    C.prototype.thing = function () { };
    C.other = function () { };
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
var d;
var r = d.foo;
var r2 = d.bar;
var r3 = d.thing();
var r4 = D.other();
var C2 = (function () {
    function C2() {
    }
    C2.prototype.thing = function (x) { };
    C2.other = function (x) { };
    return C2;
}());
var D2 = (function (_super) {
    __extends(D2, _super);
    function D2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D2;
}(C2));
var d2;
var r5 = d2.foo;
var r6 = d2.bar;
var r7 = d2.thing('');
var r8 = D2.other(1);
