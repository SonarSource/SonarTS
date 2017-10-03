//// [declarationEmitExpressionInExtends2.ts]
class C<T, U> {
    x: T;
    y: U;
}

function getClass<T>(c: T) {
    return C;
}

class MyClass extends getClass(2) <string, number> {
}

//// [declarationEmitExpressionInExtends2.js]
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
function getClass(c) {
    return C;
}
var MyClass = (function (_super) {
    __extends(MyClass, _super);
    function MyClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyClass;
}(getClass(2)));


//// [declarationEmitExpressionInExtends2.d.ts]
declare class C<T, U> {
    x: T;
    y: U;
}
declare function getClass<T>(c: T): typeof C;
declare const MyClass_base: typeof C;
declare class MyClass extends MyClass_base<string, number> {
}
