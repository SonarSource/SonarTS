//// [collisionSuperAndLocalVarInConstructor.ts]
var _super = 10; // No Error
class Foo {
    constructor() {
        var _super = 10; // No error
    }
}
class b extends Foo {
    constructor() {
        super();
        var _super = 10; // Should be error 
    }
}
class c extends Foo {
    constructor() {
        super();
        var x = () => {
            var _super = 10; // Should be error
        }
    }
}

//// [collisionSuperAndLocalVarInConstructor.js]
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
var _super = 10; // No Error
var Foo = (function () {
    function Foo() {
        var _super = 10; // No error
    }
    return Foo;
}());
var b = (function (_super) {
    __extends(b, _super);
    function b() {
        var _this = _super.call(this) || this;
        var _super = 10; // Should be error 
        return _this;
    }
    return b;
}(Foo));
var c = (function (_super) {
    __extends(c, _super);
    function c() {
        var _this = _super.call(this) || this;
        var x = function () {
            var _super = 10; // Should be error
        };
        return _this;
    }
    return c;
}(Foo));
