//// [computedPropertyNames41_ES5.ts]
class Foo { x }
class Foo2 { x; y }

class C {
    [s: string]: () => Foo2;

    // Computed properties
    static [""]() { return new Foo }
}

//// [computedPropertyNames41_ES5.js]
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
    C[""] = function () { return new Foo; };
    return C;
}());
