//// [genericInheritedDefaultConstructors.ts]
// repro from #8166
interface Constructor<T> {
    new(...args: any[]): T;
    prototype: T;
}

class A<U> { a: U; }
class B<V> extends A<V> { b: V; }
var c:Constructor<B<boolean>> = B; // shouldn't error here


//// [genericInheritedDefaultConstructors.js]
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
    function A() {
    }
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return B;
}(A));
var c = B; // shouldn't error here
