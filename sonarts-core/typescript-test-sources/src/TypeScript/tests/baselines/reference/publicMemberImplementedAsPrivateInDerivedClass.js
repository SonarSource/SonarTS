//// [publicMemberImplementedAsPrivateInDerivedClass.ts]
interface Qux {
 Bar: number;
}
class Foo implements Qux {
 private Bar: number;
}


//// [publicMemberImplementedAsPrivateInDerivedClass.js]
var Foo = (function () {
    function Foo() {
    }
    return Foo;
}());
