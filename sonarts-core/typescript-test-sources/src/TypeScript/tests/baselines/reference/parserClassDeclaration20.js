//// [parserClassDeclaration20.ts]
class C {
    0();
    "0"() { }
}

//// [parserClassDeclaration20.js]
var C = (function () {
    function C() {
    }
    C.prototype["0"] = function () { };
    return C;
}());
