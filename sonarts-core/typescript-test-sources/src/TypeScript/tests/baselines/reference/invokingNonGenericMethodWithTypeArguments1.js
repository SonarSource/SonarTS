//// [invokingNonGenericMethodWithTypeArguments1.ts]
class Foo {
    constructor() {
        this.foo<string>();
    }
}


//// [invokingNonGenericMethodWithTypeArguments1.js]
var Foo = (function () {
    function Foo() {
        this.foo();
    }
    return Foo;
}());
