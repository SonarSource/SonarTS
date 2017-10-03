//// [overloadOnConstInheritance4.ts]
interface I {
    x1(a: number, callback: (x: 'hi') => number);
}
class C implements I {
    x1(a: number, callback: (x: 'hi') => number);
    x1(a: number, callback: (x: 'hi') => number) {
    }
}


//// [overloadOnConstInheritance4.js]
var C = (function () {
    function C() {
    }
    C.prototype.x1 = function (a, callback) {
    };
    return C;
}());
