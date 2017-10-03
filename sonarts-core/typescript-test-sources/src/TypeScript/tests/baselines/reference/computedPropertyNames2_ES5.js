//// [computedPropertyNames2_ES5.ts]
var methodName = "method";
var accessorName = "accessor";
class C {
    [methodName]() { }
    static [methodName]() { }
    get [accessorName]() { }
    set [accessorName](v) { }
    static get [accessorName]() { }
    static set [accessorName](v) { }
}

//// [computedPropertyNames2_ES5.js]
var methodName = "method";
var accessorName = "accessor";
var C = (function () {
    function C() {
    }
    C.prototype[methodName] = function () { };
    C[methodName] = function () { };
    Object.defineProperty(C.prototype, accessorName, {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(C.prototype, accessorName, {
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(C, accessorName, {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(C, accessorName, {
        set: function (v) { },
        enumerable: true,
        configurable: true
    });
    return C;
}());
