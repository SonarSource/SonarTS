//// [readonlyReadonly.ts]
class C {
    readonly readonly x: number;
    constructor(readonly readonly y: number) {}
}

//// [readonlyReadonly.js]
var C = (function () {
    function C(y) {
        this.y = y;
    }
    return C;
}());
