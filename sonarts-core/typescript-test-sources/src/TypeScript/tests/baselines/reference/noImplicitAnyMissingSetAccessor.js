//// [noImplicitAnyMissingSetAccessor.ts]
abstract class Parent
{
    public abstract get message();
}

class Child extends Parent {
    public get message() {
        return "";
    }
}

//// [noImplicitAnyMissingSetAccessor.js]
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
var Parent = (function () {
    function Parent() {
    }
    return Parent;
}());
var Child = (function (_super) {
    __extends(Child, _super);
    function Child() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Child.prototype, "message", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    return Child;
}(Parent));
