//// [objectTypesIdentityWithGenericCallSignaturesDifferingByConstraints3.ts]
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

class One { foo: string }
class Two { foo: string }
interface Three { foo: string }
interface Four<T> { foo: T }
interface Five<T> extends Four<T> { }
interface Six<T, U> {
    foo: T;
}

class A {
    foo<T extends U, U extends One>(x: T, y: U): string { return null; }
}

class B<T extends U, U extends Two> {
    foo(x: T, y: U): string { return null; }
}

class C<T extends U, U extends Three> {
    foo(x: T, y: U): string { return null; }
}

class D<T extends U, U extends Four<string>> {
    foo(x: T, y: U): string { return null; }
}

interface I<T extends U, U extends Five<string>> {
    foo(x: T, y: U): string;
}

interface I2 {
    foo<T extends U, U extends Six<string, string>>(x: T, y: U): string;
}

var a: { foo<T extends U, U extends One>(x: T, y: U): string }
var b = { foo<T extends U, U extends Two>(x: T, y: U) { return ''; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B<Two, Two>);
function foo1b(x: B<Two, Two>); // error
function foo1b(x: any) { }

function foo1c(x: C<Three, Three>);
function foo1c(x: C<Three, Three>); // error
function foo1c(x: any) { }

function foo2(x: I<Five<string>, Five<string>>);
function foo2(x: I<Five<string>, Five<string>>); // error
function foo2(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B<Two, Two>); // ok
function foo5(x: any) { }

function foo5b(x: A);
function foo5b(x: C<Three, Three>); // ok
function foo5b(x: any) { }

function foo5c(x: C<Three, Three>);
function foo5c(x: D<Four<string>, Four<string>>); // error
function foo5c(x: any) { }

function foo6c(x: C<Three, Three>);
function foo6c(x: D<Four<string>, Four<string>>); // error
function foo6c(x: any) { }

function foo6(x: A);
function foo6(x: I<Five<string>, Five<string>>); // ok
function foo6(x: any) { }

function foo7(x: A);
function foo7(x: typeof a); // error
function foo7(x: any) { }

function foo8(x: B<Two, Two>);
function foo8(x: I<Five<string>, Five<string>>); // error
function foo8(x: any) { }

function foo9(x: B<Two, Two>);
function foo9(x: C<Three, Three>); // error
function foo9(x: any) { }

function foo10(x: B<Two, Two>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function foo11(x: B<Two, Two>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<Five<string>, Five<string>>);
function foo12(x: C<Three, Three>); // error
function foo12(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<Three, Three>); // ok
function foo12b(x: any) { }

function foo13(x: I<Five<string>, Five<string>>);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function foo14(x: I<Five<string>, Five<string>>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function foo15(x: I2);
function foo15(x: C<Three, Three>); // ok
function foo15(x: any) { }

//// [objectTypesIdentityWithGenericCallSignaturesDifferingByConstraints3.js]
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.
var One = (function () {
    function One() {
    }
    return One;
}());
var Two = (function () {
    function Two() {
    }
    return Two;
}());
var A = (function () {
    function A() {
    }
    A.prototype.foo = function (x, y) { return null; };
    return A;
}());
var B = (function () {
    function B() {
    }
    B.prototype.foo = function (x, y) { return null; };
    return B;
}());
var C = (function () {
    function C() {
    }
    C.prototype.foo = function (x, y) { return null; };
    return C;
}());
var D = (function () {
    function D() {
    }
    D.prototype.foo = function (x, y) { return null; };
    return D;
}());
var a;
var b = { foo: function (x, y) { return ''; } };
function foo1(x) { }
function foo1b(x) { }
function foo1c(x) { }
function foo2(x) { }
function foo3(x) { }
function foo4(x) { }
function foo5(x) { }
function foo5b(x) { }
function foo5c(x) { }
function foo6c(x) { }
function foo6(x) { }
function foo7(x) { }
function foo8(x) { }
function foo9(x) { }
function foo10(x) { }
function foo11(x) { }
function foo12(x) { }
function foo12b(x) { }
function foo13(x) { }
function foo14(x) { }
function foo15(x) { }
