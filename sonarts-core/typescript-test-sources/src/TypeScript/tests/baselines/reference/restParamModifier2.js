//// [restParamModifier2.ts]
class C {
    constructor(public ...rest: string[]) {}
}

//// [restParamModifier2.js]
var C = (function () {
    function C() {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        this.rest = rest;
    }
    return C;
}());
