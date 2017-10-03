//// [staticAndNonStaticPropertiesSameName.ts]
class C {
    x: number;
    static x: number;

    f() { }
    static f() { }
}

//// [staticAndNonStaticPropertiesSameName.js]
var C = (function () {
    function C() {
    }
    C.prototype.f = function () { };
    C.f = function () { };
    return C;
}());
