//// [unusedTypeParameterInMethod3.ts]
class A {
    public f1<X, Y, Z>() {
        var a: X;
        var b: Y;
        a;
        b;
    }
}

//// [unusedTypeParameterInMethod3.js]
var A = (function () {
    function A() {
    }
    A.prototype.f1 = function () {
        var a;
        var b;
        a;
        b;
    };
    return A;
}());
