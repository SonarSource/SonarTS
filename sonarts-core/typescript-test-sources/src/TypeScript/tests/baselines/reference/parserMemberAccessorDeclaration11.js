//// [parserMemberAccessorDeclaration11.ts]
class C {
    declare get Foo() { }
}

//// [parserMemberAccessorDeclaration11.js]
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "Foo", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
