//// [implementInterfaceAnyMemberWithVoid.ts]
interface I {
    foo(value: number);
}

class Bug implements I {
    public foo(value: number) {
    }
}


//// [implementInterfaceAnyMemberWithVoid.js]
var Bug = (function () {
    function Bug() {
    }
    Bug.prototype.foo = function (value) {
    };
    return Bug;
}());
