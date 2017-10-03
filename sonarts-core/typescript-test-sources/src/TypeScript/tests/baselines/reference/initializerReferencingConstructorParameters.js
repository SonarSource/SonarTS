//// [initializerReferencingConstructorParameters.ts]
// Initializer expressions for instance member variables are evaluated in the scope of the class constructor body but are not permitted to reference parameters or local variables of the constructor. 

class C {
    a = x; // error
    b: typeof x; // error
    constructor(x) { }
}

class D {
    a = x; // error
    b: typeof x; // error
    constructor(public x) { }
}

class E {
    a = this.x; // ok
    b: typeof this.x; // error
    constructor(public x) { }
}

class F<T> {
    a = this.x; // ok
    b = x; // error
    constructor(public x: T) { }
}

//// [initializerReferencingConstructorParameters.js]
// Initializer expressions for instance member variables are evaluated in the scope of the class constructor body but are not permitted to reference parameters or local variables of the constructor. 
var C = (function () {
    function C(x) {
        this.a = x; // error
    }
    return C;
}());
var D = (function () {
    function D(x) {
        this.x = x;
        this.a = x; // error
    }
    return D;
}());
var E = (function () {
    function E(x) {
        this.x = x;
        this.a = this.x; // ok
        this.b = this.x; // error
    }
    return E;
}());
var F = (function () {
    function F(x) {
        this.x = x;
        this.a = this.x; // ok
        this.b = x; // error
    }
    return F;
}());
