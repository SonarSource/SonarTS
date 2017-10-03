//// [classWithNoConstructorOrBaseClass.ts]
class C {
    x: string;
}

var c = new C();
var r = C;

class D<T,U> {
    x: T;
    y: U;
}

var d = new D();
var d2 = new D<string, number>();
var r2 = D;


//// [classWithNoConstructorOrBaseClass.js]
var C = (function () {
    function C() {
    }
    return C;
}());
var c = new C();
var r = C;
var D = (function () {
    function D() {
    }
    return D;
}());
var d = new D();
var d2 = new D();
var r2 = D;
