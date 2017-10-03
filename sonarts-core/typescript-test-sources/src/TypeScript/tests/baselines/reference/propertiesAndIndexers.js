//// [propertiesAndIndexers.ts]
interface X { }
interface Y {
    n: number;
}
interface Z {
    s: string;
}

interface A {
    a: Y;
    b: X;
    1: Z;
}

interface B extends A {
    [n: number]: string;
    c: boolean;
    3: boolean;
    6(): string;
}

interface B {
    4: boolean;
    5: string;
}

interface C extends A {
    [s: string]: number;
    c: boolean;
    3: boolean;
}

interface D extends B, C {
    2: Z;
    Infinity: number;
    zoo: string;
}

class P {
    [n: string]: string
}

class Q extends P {
    t: number;
}

var c: {
    [n: number]: string;
    c: boolean;
    3: boolean;
};

//// [propertiesAndIndexers.js]
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
var P = (function () {
    function P() {
    }
    return P;
}());
var Q = (function (_super) {
    __extends(Q, _super);
    function Q() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Q;
}(P));
var c;
