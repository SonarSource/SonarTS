//// [computedPropertyNamesSourceMap1_ES5.ts]
class C {
    ["hello"]() {
        debugger;
    }
    get ["goodbye"]() {
		return 0;
    }
}

//// [computedPropertyNamesSourceMap1_ES5.js]
var C = (function () {
    function C() {
    }
    C.prototype["hello"] = function () {
        debugger;
    };
    Object.defineProperty(C.prototype, "goodbye", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return C;
}());
//# sourceMappingURL=computedPropertyNamesSourceMap1_ES5.js.map