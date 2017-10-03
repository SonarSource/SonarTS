//// [duplicateConstructorOverloadSignature2.ts]
class C<T> {
    constructor(x: T);
    constructor(x: T);
    constructor(x: any) { }
}

//// [duplicateConstructorOverloadSignature2.js]
var C = (function () {
    function C(x) {
    }
    return C;
}());
