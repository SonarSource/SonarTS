//// [raiseErrorOnParameterProperty.ts]
class C1 {
  constructor(public x: X) {
  }
}
var c1 = new C1(0);
 


//// [raiseErrorOnParameterProperty.js]
var C1 = (function () {
    function C1(x) {
        this.x = x;
    }
    return C1;
}());
var c1 = new C1(0);
