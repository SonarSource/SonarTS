//// [classExpression3.ts]
let C = class extends class extends class { a = 1 } { b = 2 } { c = 3 };
let c = new C();
c.a;
c.b;
c.c;


//// [classExpression3.js]
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
var C = (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.c = 3;
        return _this;
    }
    return class_1;
}((function (_super) {
    __extends(class_2, _super);
    function class_2() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.b = 2;
        return _this;
    }
    return class_2;
}((function () {
    function class_3() {
        this.a = 1;
    }
    return class_3;
}())))));
var c = new C();
c.a;
c.b;
c.c;
