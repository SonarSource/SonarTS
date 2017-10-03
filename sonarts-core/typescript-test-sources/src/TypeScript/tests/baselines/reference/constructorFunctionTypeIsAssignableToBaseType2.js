//// [constructorFunctionTypeIsAssignableToBaseType2.ts]
// the constructor function itself does not need to be a subtype of the base type constructor function

class Base {
    static foo: {
        bar: Object;
    }
    constructor(x: Object) {
    }
}

class Derived extends Base {
    // ok
    static foo: {
        bar: number;
    }

    constructor(x: number) {
        super(x);
    }
}

class Derived2 extends Base {   
    static foo: {
        bar: number;
    }

    // ok, not enforcing assignability relation on this
    constructor(x: any) {
        super(x);
        return 1;
    }
}

//// [constructorFunctionTypeIsAssignableToBaseType2.js]
// the constructor function itself does not need to be a subtype of the base type constructor function
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
    function Base(x) {
    }
    return Base;
}());
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived(x) {
        return _super.call(this, x) || this;
    }
    return Derived;
}(Base));
var Derived2 = (function (_super) {
    __extends(Derived2, _super);
    // ok, not enforcing assignability relation on this
    function Derived2(x) {
        var _this = _super.call(this, x) || this;
        return 1;
    }
    return Derived2;
}(Base));
