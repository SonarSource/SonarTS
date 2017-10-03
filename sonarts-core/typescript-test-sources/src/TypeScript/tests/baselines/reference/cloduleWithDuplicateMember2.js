//// [cloduleWithDuplicateMember2.ts]
class C {
    set x(y) { }
    static set y(z) { }
}

module C {
    export var x = 1;
}
module C {
    export function x() { }
}

//// [cloduleWithDuplicateMember2.js]
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "x", {
        set: function (y) { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(C, "y", {
        set: function (z) { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
(function (C) {
    C.x = 1;
})(C || (C = {}));
(function (C) {
    function x() { }
    C.x = x;
})(C || (C = {}));
