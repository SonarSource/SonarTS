//// [collisionThisExpressionAndAliasInGlobal.ts]
module a {
    export var b = 10;
}
var f = () => this;
import _this = a; // Error

//// [collisionThisExpressionAndAliasInGlobal.js]
var _this = this;
var a;
(function (a) {
    a.b = 10;
})(a || (a = {}));
var f = function () { return _this; };
var _this = a; // Error
