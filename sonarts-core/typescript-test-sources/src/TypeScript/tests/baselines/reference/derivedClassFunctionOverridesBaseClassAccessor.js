//// [derivedClassFunctionOverridesBaseClassAccessor.ts]
class Base {
    get x() {
        return 1;
    }
    set x(v) {
    }
}

// error
class Derived extends Base {
    x() {
        return 1;
    }
}

//// [derivedClassFunctionOverridesBaseClassAccessor.js]
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
var Base = (function () {
    function Base() {
    }
    Object.defineProperty(Base.prototype, "x", {
        get: function () {
            return 1;
        },
        set: function (v) {
        },
        enumerable: true,
        configurable: true
    });
    return Base;
}());
// error
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Derived.prototype.x = function () {
        return 1;
    };
    return Derived;
}(Base));
