//// [recursiveFunctionTypes1.ts]
class C {
     static g(t: typeof C.g){ }
}

//// [recursiveFunctionTypes1.js]
var C = (function () {
    function C() {
    }
    C.g = function (t) { };
    return C;
}());
