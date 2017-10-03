//// [accessorsAreNotContextuallyTyped.ts]
// accessors are not contextually typed

class C {
    set x(v: (a: string) => string) {
    }

    get x() {
        return (x: string) => "";
    }
}

var c: C;
var r = c.x(''); // string

//// [accessorsAreNotContextuallyTyped.js]
// accessors are not contextually typed
var C = (function () {
    function C() {
    }
    Object.defineProperty(C.prototype, "x", {
        get: function () {
            return function (x) { return ""; };
        },
        set: function (v) {
        },
        enumerable: true,
        configurable: true
    });
    return C;
}());
var c;
var r = c.x(''); // string
