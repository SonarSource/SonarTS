//// [namespaces2.ts]
module A {
    export module B {
        export class C { }
    }
}

var c: A.B.C = new A.B.C();

//// [namespaces2.js]
var A;
(function (A) {
    var B;
    (function (B) {
        var C = (function () {
            function C() {
            }
            return C;
        }());
        B.C = C;
    })(B = A.B || (A.B = {}));
})(A || (A = {}));
var c = new A.B.C();
