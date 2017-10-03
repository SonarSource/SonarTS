//// [parserMemberAccessorDeclaration18.ts]
class C {
   set Foo(...a) { }
}

//// [parserMemberAccessorDeclaration18.js]
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "Foo", {
        set: function () {
            var a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                a[_i] = arguments[_i];
            }
        },
        enumerable: true,
        configurable: true
    });
    return C;
}());
