//// [computedPropertyNames21_ES5.ts]
class C {
    bar() {
        return 0;
    }
    [this.bar()]() { }
}

//// [computedPropertyNames21_ES5.js]
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        return 0;
    };
    C.prototype[this.bar()] = function () { };
    return C;
}());
