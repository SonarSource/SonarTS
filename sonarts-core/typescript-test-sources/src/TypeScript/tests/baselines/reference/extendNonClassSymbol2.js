//// [extendNonClassSymbol2.ts]
function Foo() {
   this.x = 1;
}
var x = new Foo(); // legal, considered a constructor function
class C extends Foo {} // error, could not find symbol Foo

//// [extendNonClassSymbol2.js]
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
function Foo() {
    this.x = 1;
}
var x = new Foo(); // legal, considered a constructor function
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return C;
}(Foo)); // error, could not find symbol Foo
