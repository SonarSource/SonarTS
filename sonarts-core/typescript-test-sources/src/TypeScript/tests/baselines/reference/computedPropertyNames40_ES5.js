//// [computedPropertyNames40_ES5.ts]
class Foo { x }
class Foo2 { x; y }

class C {
    [s: string]: () => Foo2;

    // Computed properties
    [""]() { return new Foo }
    [""]() { return new Foo2 }
}

//// [computedPropertyNames40_ES5.js]
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
    // Computed properties
    C.prototype[""] = function () { return new Foo; };
    C.prototype[""] = function () { return new Foo2; };
    return C;
}());
