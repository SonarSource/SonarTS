//// [unionTypeEquivalence.ts]
// A | B is equivalent to A if B is a subtype of A
class C { }
class D extends C { foo() { } }
var x: C;
var x : C | D;

// A | B is equivalent to B | A.
var y: string | number;
var y : number | string;

// AB | C is equivalent to A | BC, where AB is A | B and BC is B | C.
var z : string | number | boolean;
var z : (string | number) | boolean;
var z : string | (number | boolean);
var AB : string | number;
var BC : number | boolean;
var z1: typeof AB | boolean;
var z1: string | typeof BC;


//// [unionTypeEquivalence.js]
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
// A | B is equivalent to A if B is a subtype of A
var C = (function () {
    function C() {
    }
    return C;
}());
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    D.prototype.foo = function () { };
    return D;
}(C));
var x;
var x;
// A | B is equivalent to B | A.
var y;
var y;
// AB | C is equivalent to A | BC, where AB is A | B and BC is B | C.
var z;
var z;
var z;
var AB;
var BC;
var z1;
var z1;
