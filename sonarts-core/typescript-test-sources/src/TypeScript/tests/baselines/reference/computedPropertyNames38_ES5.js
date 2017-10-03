//// [computedPropertyNames38_ES5.ts]
class Foo { x }
class Foo2 { x; y }

class C {
    [s: string]: Foo2;

    // Computed properties
    get [1 << 6]() { return new Foo }
    set [1 << 6](p: Foo2) { }
}

//// [computedPropertyNames38_ES5.js]
var Foo = (function () {
    function Foo() {
    }
    return Foo;
}());
var Foo2 = (function () {
    function Foo2() {
    }
    return Foo2;
}());
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, 1 << 6, {
        // Computed properties
        get: function () { return new Foo; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(C.prototype, 1 << 6, {
        set: function (p) { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
