//// [baseIndexSignatureResolution.ts]
class Base { private a: string; }
class Derived extends Base { private b: string; }

// Note - commmenting "extends Foo" prevents the error
interface Foo {
    [i: number]: Base;
}
interface FooOf<TBase extends Base> extends Foo {
    [i: number]: TBase;
}
var x: FooOf<Derived> = null;
var y: Derived = x[0];

/*
// Note - the equivalent for normal interface methods works fine:
interface A {
    foo(): Base;
}
interface B<TBase extends Base> extends A {
    foo(): TBase;
}
var b: B<Derived> = null;
var z: Derived = b.foo();
*/

//// [baseIndexSignatureResolution.js]
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
    return Base;
}());
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived;
}(Base));
var x = null;
var y = x[0];
/*
// Note - the equivalent for normal interface methods works fine:
interface A {
    foo(): Base;
}
interface B<TBase extends Base> extends A {
    foo(): TBase;
}
var b: B<Derived> = null;
var z: Derived = b.foo();
*/ 
