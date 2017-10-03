//// [constructorImplementationWithDefaultValues.ts]
class C {
    constructor(x);
    constructor(x = 1) {
        var y = x;
    }
}

class D<T> {
    constructor(x);
    constructor(x:T = null) {
        var y = x;
    }
}

class E<T extends Date> {
    constructor(x);
    constructor(x: T = null) {
        var y = x;
    }
}

//// [constructorImplementationWithDefaultValues.js]
var C = (function () {
    function C(x) {
        if (x === void 0) { x = 1; }
        var y = x;
    }
    return C;
}());
var D = (function () {
    function D(x) {
        if (x === void 0) { x = null; }
        var y = x;
    }
    return D;
}());
var E = (function () {
    function E(x) {
        if (x === void 0) { x = null; }
        var y = x;
    }
    return E;
}());
