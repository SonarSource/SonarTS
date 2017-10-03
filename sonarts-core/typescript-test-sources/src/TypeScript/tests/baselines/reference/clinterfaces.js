//// [clinterfaces.ts]
module M {
    class C { }
    interface C { }
    interface D { }
    class D { }
}

interface Foo<T> {
    a: string;
}

class Foo<T>{
    b: number;
}

class Bar<T>{
    b: number;
}

interface Bar<T> {
    a: string;
}

export = Foo;


//// [clinterfaces.js]
"use strict";
var M;
(function (M) {
    var C = (function () {
        function C() {
        }
        return C;
    }());
    var D = (function () {
        function D() {
        }
        return D;
    }());
})(M || (M = {}));
var Foo = (function () {
    function Foo() {
    }
    return Foo;
}());
var Bar = (function () {
    function Bar() {
    }
    return Bar;
}());
module.exports = Foo;
