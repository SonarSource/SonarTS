//// [parserParameterList17.ts]
class C {
   constructor(a = 4);
   constructor(a, b) { }
}

//// [parserParameterList17.js]
var C = (function () {
    function C(a, b) {
    }
    return C;
}());
