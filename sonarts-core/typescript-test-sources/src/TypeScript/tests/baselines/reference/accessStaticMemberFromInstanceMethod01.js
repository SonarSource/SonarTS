//// [accessStaticMemberFromInstanceMethod01.ts]
class C {
    foo: string;

    static bar() {
        let k = foo;
    }
}

//// [accessStaticMemberFromInstanceMethod01.js]
var C = (function () {
    function C() {
    }
    C.bar = function () {
        var k = foo;
    };
    return C;
}());
