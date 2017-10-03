//// [recursiveCloduleReference.ts]
module M
{
  export class C {
  }
  export module C {
    export var C = M.C
  };
};
 


//// [recursiveCloduleReference.js]
var M;
(function (M) {
    var C = (function () {
        function C() {
        }
        return C;
    }());
    M.C = C;
    (function (C_1) {
        C_1.C = M.C;
    })(C = M.C || (M.C = {}));
    ;
})(M || (M = {}));
;
