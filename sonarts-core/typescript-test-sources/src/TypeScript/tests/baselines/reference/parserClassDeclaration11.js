//// [parserClassDeclaration11.ts]
class C {
   constructor();
   foo() { }
}

//// [parserClassDeclaration11.js]
var C = (function () {
    function C() {
    }
    C.prototype.foo = function () { };
    return C;
}());
