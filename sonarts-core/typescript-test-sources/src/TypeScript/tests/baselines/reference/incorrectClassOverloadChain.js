//// [incorrectClassOverloadChain.ts]
class C {
    foo(): string;
    foo(x): number;
    x = 1;
}

//// [incorrectClassOverloadChain.js]
var C = (function () {
    function C() {
        this.x = 1;
    }
    return C;
}());
