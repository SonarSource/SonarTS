//// [bases.ts]
interface I {
    x;
}

class B {
    constructor() {
        this.y: any;
    }
}

class C extends B implements I {
    constructor() {
        this.x: any;
    }
}

new C().x;
new C().y;



//// [bases.js]
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
    function B() {
        this.y;
        any;
    }
    return B;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        var _this = this;
        _this.x;
        any;
        return _this;
    }
    return C;
}(B));
new C().x;
new C().y;
