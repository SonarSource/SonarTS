//// [constructorWithAssignableReturnExpression.ts]
// a class constructor may return an expression, it must be assignable to the class instance type to be valid

class C {
    constructor() {
        return 1;
    }
}

class D {
    x: number;
    constructor() {
        return 1; // error
    }
}

class E {
    x: number;
    constructor() {
        return { x: 1 };
    }
}

class F<T> {
    x: T;
    constructor() {
        return { x: 1 }; // error
    }
}

class G<T> {
    x: T;
    constructor() {
        return { x: <T>null };
    }
}

//// [constructorWithAssignableReturnExpression.js]
// a class constructor may return an expression, it must be assignable to the class instance type to be valid
var C = (function () {
    function C() {
        return 1;
    }
    return C;
}());
var D = (function () {
    function D() {
        return 1; // error
    }
    return D;
}());
var E = (function () {
    function E() {
        return { x: 1 };
    }
    return E;
}());
var F = (function () {
    function F() {
        return { x: 1 }; // error
    }
    return F;
}());
var G = (function () {
    function G() {
        return { x: null };
    }
    return G;
}());
