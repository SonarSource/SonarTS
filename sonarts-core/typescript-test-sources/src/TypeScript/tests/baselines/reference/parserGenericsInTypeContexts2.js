//// [parserGenericsInTypeContexts2.ts]
class C extends A<X<T>, Y<Z<T>>> implements B<X<T>, Y<Z<T>>> {
}

var v1: C<X<T>, Y<Z<T>>>;
var v2: D<X<T>, Y<Z<T>>> = null;
var v3: E.F<X<T>, Y<Z<T>>>;
var v4: G.H.I<X<T>, Y<Z<T>>>;
var v6: K<X<T>, Y<Z<T>>>[];


function f1(a: E<X<T>, Y<Z<T>>>) {
}

function f2(): F<X<T>, Y<Z<T>>> {
}



//// [parserGenericsInTypeContexts2.js]
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
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return C;
}(A));
var v1;
var v2 = null;
var v3;
var v4;
var v6;
function f1(a) {
}
function f2() {
}
