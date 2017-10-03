//// [superCallWithCommentEmit01.ts]
class A {
    constructor(public text: string) { }
}

class B extends A {
    constructor(text: string) {
        // this is subclass constructor
        super(text)
     }
}

//// [superCallWithCommentEmit01.js]
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
    function A(text) {
        this.text = text;
    }
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B(text) {
        // this is subclass constructor
        return _super.call(this, text) || this;
    }
    return B;
}(A));
