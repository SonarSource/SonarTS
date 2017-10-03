//// [comparisonOperatorWithSubtypeObjectOnIndexSignature.ts]
class Base {
    public a: string;
}

class Derived extends Base {
    public b: string;
}

var a1: { [a: string]: string };
var b1: { [b: string]: string };

var a2: { [index: string]: Base };
var b2: { [index: string]: Derived };

var a3: { [index: number]: string };
var b3: { [index: number]: string };

var a4: { [index: number]: Base };
var b4: { [index: string]: Derived };

// operator <
var r1a1 = a1 < b1;
var r1a1 = a2 < b2;
var r1a1 = a3 < b3;
var r1a1 = a4 < b4;

var r1b1 = b1 < a1;
var r1b1 = b2 < a2;
var r1b1 = b3 < a3;
var r1b1 = b4 < a4;

// operator >
var r2a1 = a1 > b1;
var r2a1 = a2 > b2;
var r2a1 = a3 > b3;
var r2a1 = a4 > b4;

var r2b1 = b1 > a1;
var r2b1 = b2 > a2;
var r2b1 = b3 > a3;
var r2b1 = b4 > a4;

// operator <=
var r3a1 = a1 <= b1;
var r3a1 = a2 <= b2;
var r3a1 = a3 <= b3;
var r3a1 = a4 <= b4;

var r3b1 = b1 <= a1;
var r3b1 = b2 <= a2;
var r3b1 = b3 <= a3;
var r3b1 = b4 <= a4;

// operator >=
var r4a1 = a1 >= b1;
var r4a1 = a2 >= b2;
var r4a1 = a3 >= b3;
var r4a1 = a4 >= b4;

var r4b1 = b1 >= a1;
var r4b1 = b2 >= a2;
var r4b1 = b3 >= a3;
var r4b1 = b4 >= a4;

// operator ==
var r5a1 = a1 == b1;
var r5a1 = a2 == b2;
var r5a1 = a3 == b3;
var r5a1 = a4 == b4;

var r5b1 = b1 == a1;
var r5b1 = b2 == a2;
var r5b1 = b3 == a3;
var r5b1 = b4 == a4;

// operator !=
var r6a1 = a1 != b1;
var r6a1 = a2 != b2;
var r6a1 = a3 != b3;
var r6a1 = a4 != b4;

var r6b1 = b1 != a1;
var r6b1 = b2 != a2;
var r6b1 = b3 != a3;
var r6b1 = b4 != a4;

// operator ===
var r7a1 = a1 === b1;
var r7a1 = a2 === b2;
var r7a1 = a3 === b3;
var r7a1 = a4 === b4;

var r7b1 = b1 === a1;
var r7b1 = b2 === a2;
var r7b1 = b3 === a3;
var r7b1 = b4 === a4;

// operator !==
var r8a1 = a1 !== b1;
var r8a1 = a2 !== b2;
var r8a1 = a3 !== b3;
var r8a1 = a4 !== b4;

var r8b1 = b1 !== a1;
var r8b1 = b2 !== a2;
var r8b1 = b3 !== a3;
var r8b1 = b4 !== a4;

//// [comparisonOperatorWithSubtypeObjectOnIndexSignature.js]
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
var a1;
var b1;
var a2;
var b2;
var a3;
var b3;
var a4;
var b4;
// operator <
var r1a1 = a1 < b1;
var r1a1 = a2 < b2;
var r1a1 = a3 < b3;
var r1a1 = a4 < b4;
var r1b1 = b1 < a1;
var r1b1 = b2 < a2;
var r1b1 = b3 < a3;
var r1b1 = b4 < a4;
// operator >
var r2a1 = a1 > b1;
var r2a1 = a2 > b2;
var r2a1 = a3 > b3;
var r2a1 = a4 > b4;
var r2b1 = b1 > a1;
var r2b1 = b2 > a2;
var r2b1 = b3 > a3;
var r2b1 = b4 > a4;
// operator <=
var r3a1 = a1 <= b1;
var r3a1 = a2 <= b2;
var r3a1 = a3 <= b3;
var r3a1 = a4 <= b4;
var r3b1 = b1 <= a1;
var r3b1 = b2 <= a2;
var r3b1 = b3 <= a3;
var r3b1 = b4 <= a4;
// operator >=
var r4a1 = a1 >= b1;
var r4a1 = a2 >= b2;
var r4a1 = a3 >= b3;
var r4a1 = a4 >= b4;
var r4b1 = b1 >= a1;
var r4b1 = b2 >= a2;
var r4b1 = b3 >= a3;
var r4b1 = b4 >= a4;
// operator ==
var r5a1 = a1 == b1;
var r5a1 = a2 == b2;
var r5a1 = a3 == b3;
var r5a1 = a4 == b4;
var r5b1 = b1 == a1;
var r5b1 = b2 == a2;
var r5b1 = b3 == a3;
var r5b1 = b4 == a4;
// operator !=
var r6a1 = a1 != b1;
var r6a1 = a2 != b2;
var r6a1 = a3 != b3;
var r6a1 = a4 != b4;
var r6b1 = b1 != a1;
var r6b1 = b2 != a2;
var r6b1 = b3 != a3;
var r6b1 = b4 != a4;
// operator ===
var r7a1 = a1 === b1;
var r7a1 = a2 === b2;
var r7a1 = a3 === b3;
var r7a1 = a4 === b4;
var r7b1 = b1 === a1;
var r7b1 = b2 === a2;
var r7b1 = b3 === a3;
var r7b1 = b4 === a4;
// operator !==
var r8a1 = a1 !== b1;
var r8a1 = a2 !== b2;
var r8a1 = a3 !== b3;
var r8a1 = a4 !== b4;
var r8b1 = b1 !== a1;
var r8b1 = b2 !== a2;
var r8b1 = b3 !== a3;
var r8b1 = b4 !== a4;
