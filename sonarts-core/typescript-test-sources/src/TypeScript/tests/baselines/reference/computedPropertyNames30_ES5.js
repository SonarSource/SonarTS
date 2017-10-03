//// [computedPropertyNames30_ES5.ts]
class Base {
}
class C extends Base {
    constructor() {
        super();
        () => {
            var obj = {
                // Ideally, we would capture this. But the reference is
                // illegal, and not capturing this is consistent with
                //treatment of other similar violations.
                [(super(), "prop")]() { }
            };
        }
    }
}

//// [computedPropertyNames30_ES5.js]
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
    return Base;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        var _this = _super.call(this) || this;
        (function () {
            var obj = (_a = {},
                // Ideally, we would capture this. But the reference is
                // illegal, and not capturing this is consistent with
                //treatment of other similar violations.
                _a[(_this = _super.call(this) || this, "prop")] = function () { },
                _a);
            var _a;
        });
        return _this;
    }
    return C;
}(Base));
