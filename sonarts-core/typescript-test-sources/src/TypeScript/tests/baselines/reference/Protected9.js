//// [Protected9.ts]
class C {
   constructor(protected p) { }
}

//// [Protected9.js]
var C = (function () {
    function C(p) {
        this.p = p;
    }
    return C;
}());
