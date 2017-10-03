//// [circularImportAlias.ts]
// expected no error

module B {
    export import a = A;
    export class D extends a.C {
        id: number;
    }
}

module A {
    export class C { name: string }
    export import b = B;
}

var c: { name: string };
var c = new B.a.C();




//// [circularImportAlias.js]
// expected no error
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
var B;
(function (B) {
    B.a = A;
    var D = (function (_super) {
        __extends(D, _super);
        function D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return D;
    }(B.a.C));
    B.D = D;
})(B || (B = {}));
var A;
(function (A) {
    var C = (function () {
        function C() {
        }
        return C;
    }());
    A.C = C;
    A.b = B;
})(A || (A = {}));
var c;
var c = new B.a.C();
