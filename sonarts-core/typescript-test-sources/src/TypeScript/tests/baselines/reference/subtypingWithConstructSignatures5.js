//// [subtypingWithConstructSignatures5.ts]
// checking subtype relations for function types as it relates to contextual signature instantiation
// same as subtypingWithConstructSignatures2 just with an extra level of indirection in the inheritance chain

class Base { foo: string; }
class Derived extends Base { bar: string; }
class Derived2 extends Derived { baz: string; }
class OtherDerived extends Base { bing: string; }

interface A { // T
    // M's
    a: new (x: number) => number[];
    a2: new (x: number) => string[];
    a3: new (x: number) => void;
    a4: new (x: string, y: number) => string;
    a5: new (x: (arg: string) => number) => string;
    a6: new (x: (arg: Base) => Derived) => Base;
    a7: new (x: (arg: Base) => Derived) => (r: Base) => Derived;
    a8: new (x: (arg: Base) => Derived, y: (arg2: Base) => Derived) => (r: Base) => Derived;
    a9: new (x: (arg: Base) => Derived, y: (arg2: Base) => Derived) => (r: Base) => Derived;
    a10: new (...x: Derived[]) => Derived;
    a11: new (x: { foo: string }, y: { foo: string; bar: string }) => Base;
    a12: new (x: Array<Base>, y: Array<Derived2>) => Array<Derived>;
    a13: new (x: Array<Base>, y: Array<Derived>) => Array<Derived>;
    a14: new (x: { a: string; b: number }) => Object;
}

interface B extends A {
    a: new <T>(x: T) => T[];
}

// S's
interface I extends B {
    // N's
    a: new <T>(x: T) => T[]; // ok, instantiation of N is a subtype of M, T is number
    a2: new <T>(x: T) => string[]; // ok
    a3: new <T>(x: T) => T; // ok since Base returns void
    a4: new <T, U>(x: T, y: U) => T; // ok, instantiation of N is a subtype of M, T is string, U is number
    a5: new <T, U>(x: (arg: T) => U) => T; // ok, U is in a parameter position so inferences can be made
    a6: new <T extends Base, U extends Derived>(x: (arg: T) => U) => T; // ok, same as a5 but with object type hierarchy
    a7: new <T extends Base, U extends Derived>(x: (arg: T) => U) => (r: T) => U; // ok
    a8: new <T extends Base, U extends Derived>(x: (arg: T) => U, y: (arg2: T) => U) => (r: T) => U; // ok
    a9: new <T extends Base, U extends Derived>(x: (arg: T) => U, y: (arg2: { foo: string; bing: number }) => U) => (r: T) => U; // ok, same as a8 with compatible object literal
    a10: new <T extends Derived>(...x: T[]) => T; // ok
    a11: new <T extends Base>(x: T, y: T) => T; // ok
    a12: new <T extends Array<Base>>(x: Array<Base>, y: T) => Array<Derived>; // ok, less specific parameter type
    a13: new <T extends Array<Derived>>(x: Array<Base>, y: T) => T; // ok, T = Array<Derived>, satisfies constraint, contextual signature instantiation succeeds
    a14: new <T>(x: { a: T; b: T }) => T; // ok, best common type yields T = {} but that's satisfactory for this signature
}

//// [subtypingWithConstructSignatures5.js]
// checking subtype relations for function types as it relates to contextual signature instantiation
// same as subtypingWithConstructSignatures2 just with an extra level of indirection in the inheritance chain
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
var Derived2 = (function (_super) {
    __extends(Derived2, _super);
    function Derived2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Derived2;
}(Derived));
var OtherDerived = (function (_super) {
    __extends(OtherDerived, _super);
    function OtherDerived() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OtherDerived;
}(Base));
