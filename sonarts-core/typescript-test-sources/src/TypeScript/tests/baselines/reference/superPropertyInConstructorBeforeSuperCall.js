//// [superPropertyInConstructorBeforeSuperCall.ts]
class B {
    constructor(x?: string) {}
    x(): string { return ""; }
}
class C1 extends B {
    constructor() {
        super.x();
        super();
    }
}
class C2 extends B {
    constructor() {
        super(super.x());
    }
}

//// [superPropertyInConstructorBeforeSuperCall.js]
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
var B = (function () {
    function B(x) {
    }
    B.prototype.x = function () { return ""; };
    return B;
}());
var C1 = (function (_super) {
    __extends(C1, _super);
    function C1() {
        var _this = this;
        _super.prototype.x.call(_this);
        _this = _super.call(this) || this;
        return _this;
    }
    return C1;
}(B));
var C2 = (function (_super) {
    __extends(C2, _super);
    function C2() {
        var _this = _super.call(this, _super.prototype.x.call(_this)) || this;
        return _this;
    }
    return C2;
}(B));
