//// [typeGuardFunction.ts]
class A {
    propA: number;
}

class B {
    propB: number;
}

class C extends A {
    propC: number;
}

declare function isA(p1: any): p1 is A;
declare function isB(p1: any): p1 is B;
declare function isC(p1: any): p1 is C;

declare function retC(): C;

var a: A;
var b: B;

// Basic
if (isC(a)) {
    a.propC;
}

// Sub type
var subType: C;
if(isA(subType)) {
    subType.propC;
}

// Union type
var union: A | B;
if(isA(union)) {
    union.propA;
}

// Call signature
interface I1 {
    (p1: A): p1 is C;
}

// The parameter index and argument index for the type guard target is matching.
// The type predicate type is assignable to the parameter type.
declare function isC_multipleParams(p1, p2): p1 is C;
if (isC_multipleParams(a, 0)) {
    a.propC;
}

// Methods
var obj: {
    func1(p1: A): p1 is C;
}
class D {
    method1(p1: A): p1 is C {
        return true;
    }
}

// Arrow function
let f1 = (p1: A): p1 is C => false;

// Function type
declare function f2(p1: (p1: A) => p1 is C);

// Function expressions
f2(function(p1: A): p1 is C {
    return true;
});

// Evaluations are asssignable to boolean.
declare function acceptingBoolean(a: boolean);
acceptingBoolean(isA(a));

// Type predicates with different parameter name.
declare function acceptingTypeGuardFunction(p1: (item) => item is A);
acceptingTypeGuardFunction(isA);

// Binary expressions
let union2: C | B;
let union3: boolean | B = isA(union2) || union2;

//// [typeGuardFunction.js]
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
var B = (function () {
    function B() {
    }
    return B;
}());
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return C;
}(A));
var a;
var b;
// Basic
if (isC(a)) {
    a.propC;
}
// Sub type
var subType;
if (isA(subType)) {
    subType.propC;
}
// Union type
var union;
if (isA(union)) {
    union.propA;
}
if (isC_multipleParams(a, 0)) {
    a.propC;
}
// Methods
var obj;
var D = (function () {
    function D() {
    }
    D.prototype.method1 = function (p1) {
        return true;
    };
    return D;
}());
// Arrow function
var f1 = function (p1) { return false; };
// Function expressions
f2(function (p1) {
    return true;
});
acceptingBoolean(isA(a));
acceptingTypeGuardFunction(isA);
// Binary expressions
var union2;
var union3 = isA(union2) || union2;
