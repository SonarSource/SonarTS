//// [derivedClassOverridesPrivates.ts]
class Base {
    private x: { foo: string };
}

class Derived extends Base {
    private x: { foo: string; bar: string; }; // error
}

class Base2 {
    private static y: { foo: string };
}

class Derived2 extends Base2 {
    private static y: { foo: string; bar: string; }; // error
}

//// [derivedClassOverridesPrivates.js]
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
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived;
}(Base));
var Base2 = (function () {
    function Base2() {
    }
    return Base2;
}());
var Derived2 = (function (_super) {
    __extends(Derived2, _super);
    function Derived2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived2;
}(Base2));
