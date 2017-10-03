//// [defaultValueInConstructorOverload1.ts]
class C {
    constructor(x = '');
    constructor(x = '') {
    }
}

//// [defaultValueInConstructorOverload1.js]
var C = (function () {
    function C(x) {
        if (x === void 0) { x = ''; }
    }
    return C;
}());
