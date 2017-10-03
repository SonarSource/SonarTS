//// [propertyAndFunctionWithSameName.ts]
class C {
    x: number;
    x() { // error
        return 1;
    }
}

class D {
    x: number;
    x(v) { } // error
}

//// [propertyAndFunctionWithSameName.js]
var C = (function () {
    function C() {
    }
    C.prototype.x = function () {
        return 1;
    };
    return C;
}());
var D = (function () {
    function D() {
    }
    D.prototype.x = function (v) { }; // error
    return D;
}());
