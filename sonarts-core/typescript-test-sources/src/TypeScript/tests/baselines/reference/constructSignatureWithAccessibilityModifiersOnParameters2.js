//// [constructSignatureWithAccessibilityModifiersOnParameters2.ts]
// Parameter properties are not valid in overloads of constructors

class C {
    constructor(public x, private y);
    constructor(public x, private y) { }
}

class C2 {
    constructor(private x);
    constructor(public x) { }
}

class C3 {
    constructor(private x);
    constructor(private y) { }
}

interface I {
    new (public x);
    new (public x);
}

interface I2 {
    new (private x);
    new (private x);
}

var a: {
    new (public x);
    new (public y);
}

var b: {
    new (private x);
    new (private y);
}

//// [constructSignatureWithAccessibilityModifiersOnParameters2.js]
// Parameter properties are not valid in overloads of constructors
var C = (function () {
    function C(x, y) {
        this.x = x;
        this.y = y;
    }
    return C;
}());
var C2 = (function () {
    function C2(x) {
        this.x = x;
    }
    return C2;
}());
var C3 = (function () {
    function C3(y) {
        this.y = y;
    }
    return C3;
}());
var a;
var b;
