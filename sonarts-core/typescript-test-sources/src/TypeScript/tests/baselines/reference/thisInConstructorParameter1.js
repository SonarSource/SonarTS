//// [thisInConstructorParameter1.ts]
class Foo {
    public y;
    constructor(x = this.y) { }
}

//// [thisInConstructorParameter1.js]
var Foo = (function () {
    function Foo(x) {
        if (x === void 0) { x = this.y; }
    }
    return Foo;
}());
