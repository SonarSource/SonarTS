//// [classAbstractSingleLineDecl.ts]
abstract class A {}

abstract
class B {}

abstract

class C {}

new A;
new B;
new C;

//// [classAbstractSingleLineDecl.js]
var A = (function () {
    function A() {
    }
    return A;
}());
abstract;
var B = (function () {
    function B() {
    }
    return B;
}());
abstract;
var C = (function () {
    function C() {
    }
    return C;
}());
new A;
new B;
new C;
