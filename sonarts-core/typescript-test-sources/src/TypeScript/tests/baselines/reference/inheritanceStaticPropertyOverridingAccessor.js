//// [inheritanceStaticPropertyOverridingAccessor.ts]
class a {
    static get x(): () => string {
        return null;;
    }
    static set x(aValue: () => string) {
    }
}

class b extends a {
    static x: () => string;
}

//// [inheritanceStaticPropertyOverridingAccessor.js]
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var a = (function () {
    function a() {
    }
    Object.defineProperty(a, "x", {
        get: function () {
            return null;
            ;
        },
        set: function (aValue) {
        },
        enumerable: true,
        configurable: true
    });
    return a;
}());
var b = (function (_super) {
    __extends(b, _super);
    function b() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return b;
}(a));
