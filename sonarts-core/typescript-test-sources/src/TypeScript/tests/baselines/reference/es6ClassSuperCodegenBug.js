//// [es6ClassSuperCodegenBug.ts]
class A {
	constructor(str1:string, str2:string) {}
}
class B extends A {
    constructor() {
	    if (true) {
	        super('a1', 'b1');
	    } else {
	        super('a2', 'b2');
	    }
    }
}


//// [es6ClassSuperCodegenBug.js]
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
    function A(str1, str2) {
    }
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        var _this = this;
        if (true) {
            _this = _super.call(this, 'a1', 'b1') || this;
        }
        else {
            _this = _super.call(this, 'a2', 'b2') || this;
        }
        return _this;
    }
    return B;
}(A));
