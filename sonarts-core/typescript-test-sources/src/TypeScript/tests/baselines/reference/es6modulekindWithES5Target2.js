//// [es6modulekindWithES5Target2.ts]
export default class C {
    static s = 0;
    p = 1;
    method() { }
}


//// [es6modulekindWithES5Target2.js]
var C = (function () {
    function C() {
        this.p = 1;
    }
    C.prototype.method = function () { };
    return C;
}());
export default C;
C.s = 0;
