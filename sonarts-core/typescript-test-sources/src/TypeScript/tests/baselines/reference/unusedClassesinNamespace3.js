//// [unusedClassesinNamespace3.ts]
namespace Validation {
    class c1 {

    }

    export class c2 {

    }

    export let a = new c1();
}

//// [unusedClassesinNamespace3.js]
var Validation;
(function (Validation) {
    var c1 = (function () {
        function c1() {
        }
        return c1;
    }());
    var c2 = (function () {
        function c2() {
        }
        return c2;
    }());
    Validation.c2 = c2;
    Validation.a = new c1();
})(Validation || (Validation = {}));
