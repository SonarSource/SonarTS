//// [derivedClassConstructorWithoutSuperCall.ts]
// derived class constructors must contain a super call

class Base {
    x: string;
}

class Derived extends Base {
    constructor() { // error
    }
}

class Base2<T> {
    x: T;
}

class Derived2<T> extends Base2<T> {
    constructor() { // error for no super call (nested scopes don't count)
        var r2 = () => super(); // error for misplaced super call (nested function)
    }
}

class Derived3<T> extends Base2<T> {
    constructor() { // error
        var r = function () { super() } // error
    }
}

class Derived4<T> extends Base2<T> {
    constructor() {
        var r = super(); // ok
    }
}

//// [derivedClassConstructorWithoutSuperCall.js]
// derived class constructors must contain a super call
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
        var _this = this;
        return _this;
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
        var _this = this;
        var r2 = function () { return _this = _super.call(this) || this; }; // error for misplaced super call (nested function)
        return _this;
    }
    return Derived2;
}(Base2));
var Derived3 = (function (_super) {
    __extends(Derived3, _super);
    function Derived3() {
        var _this = this;
        var r = function () { _this = _super.call(this) || this; }; // error
        return _this;
    }
    return Derived3;
}(Base2));
var Derived4 = (function (_super) {
    __extends(Derived4, _super);
    function Derived4() {
        var _this = this;
        var r = _this = _super.call(this) || this; // ok
        return _this;
    }
    return Derived4;
}(Base2));
