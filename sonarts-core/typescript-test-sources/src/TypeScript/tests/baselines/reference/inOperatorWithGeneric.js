//// [inOperatorWithGeneric.ts]
class C<T> {
    foo(x:T) {
        for (var p in x) {
        }
    }
}

//// [inOperatorWithGeneric.js]
var C = (function () {
    function C() {
    }
    C.prototype.foo = function (x) {
        for (var p in x) {
        }
    };
    return C;
}());
