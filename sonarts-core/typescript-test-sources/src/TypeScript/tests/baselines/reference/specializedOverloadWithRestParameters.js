//// [specializedOverloadWithRestParameters.ts]
class Base { foo() { } }
class Derived1 extends Base { bar() { } }
function f(tagName: 'span', ...args): Derived1;   // error
function f(tagName: number, ...args): Base;
function f(tagName: any): Base {
    return null;
}
function g(tagName: 'span', arg): Derived1;    // error
function g(tagName: number, arg): Base;
function g(tagName: any): Base {
    return null;
}

//// [specializedOverloadWithRestParameters.js]
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
var Base = (function () {
    function Base() {
    }
    Base.prototype.foo = function () { };
    return Base;
}());
var Derived1 = (function (_super) {
    __extends(Derived1, _super);
    function Derived1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Derived1.prototype.bar = function () { };
    return Derived1;
}(Base));
function f(tagName) {
    return null;
}
function g(tagName) {
    return null;
}
