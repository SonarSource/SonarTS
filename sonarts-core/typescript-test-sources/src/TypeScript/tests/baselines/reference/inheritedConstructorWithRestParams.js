//// [inheritedConstructorWithRestParams.ts]
class Base {
    constructor(...a: string[]) { }
}

class Derived extends Base { }

// Ok
new Derived("", "");
new Derived("");
new Derived();

// Errors
new Derived("", 3);
new Derived(3);

//// [inheritedConstructorWithRestParams.js]
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
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
    }
    return Base;
}());
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived;
}(Base));
// Ok
new Derived("", "");
new Derived("");
new Derived();
// Errors
new Derived("", 3);
new Derived(3);
