//// [parserErrorRecovery_ClassElement2.ts]
module M {
  class C {

  enum E {
  }
}

//// [parserErrorRecovery_ClassElement2.js]
var M;
(function (M) {
    var C = (function () {
        function C() {
        }
        return C;
    }());
    var E;
    (function (E) {
    })(E || (E = {}));
})(M || (M = {}));
