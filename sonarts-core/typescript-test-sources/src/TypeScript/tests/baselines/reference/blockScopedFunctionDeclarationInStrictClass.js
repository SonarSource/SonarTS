//// [blockScopedFunctionDeclarationInStrictClass.ts]
class c {
    method() {
        if (true) {
            function foo() { }
            foo(); // ok
        }
        foo(); // not ok
    }
}

//// [blockScopedFunctionDeclarationInStrictClass.js]
var c = (function () {
    function c() {
    }
    c.prototype.method = function () {
        if (true) {
            function foo() { }
            foo(); // ok
        }
        foo(); // not ok
    };
    return c;
}());
