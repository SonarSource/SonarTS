//// [implementsInClassExpression.ts]
interface Foo {
    doThing(): void;
}

let cls = class implements Foo {
    doThing() { }
}

//// [implementsInClassExpression.js]
var cls = (function () {
    function class_1() {
    }
    class_1.prototype.doThing = function () { };
    return class_1;
}());
