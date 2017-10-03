//// [superPropertyAccessInSuperCall01.ts]
class A {
	constructor(f: string) {
	}
	public blah(): string { return ""; }
}

class B extends A {
	constructor() {
		super(super.blah())
	}
}

//// [superPropertyAccessInSuperCall01.js]
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
var A = (function () {
    function A(f) {
    }
    A.prototype.blah = function () { return ""; };
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        var _this = _super.call(this, _super.prototype.blah.call(_this)) || this;
        return _this;
    }
    return B;
}(A));
