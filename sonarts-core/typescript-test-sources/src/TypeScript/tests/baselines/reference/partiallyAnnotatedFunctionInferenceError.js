//// [partiallyAnnotatedFunctionInferenceError.ts]
class C {
  test: string
}

class D extends C {
  test2: string
}

declare function testError<T extends C>(a: (t: T, t1: T) => void): T

// more args
testError((t1: D, t2, t3) => {})
testError((t1, t2: D, t3) => {})
testError((t1, t2, t3: D) => {})


//// [partiallyAnnotatedFunctionInferenceError.js]
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
var C = (function () {
    function C() {
    }
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
// more args
testError(function (t1, t2, t3) { });
testError(function (t1, t2, t3) { });
testError(function (t1, t2, t3) { });
