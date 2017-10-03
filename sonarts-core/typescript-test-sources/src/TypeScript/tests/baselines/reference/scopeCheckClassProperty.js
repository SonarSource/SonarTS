//// [scopeCheckClassProperty.ts]
class C {
  constructor() {
    new A().p; // ok
  }
  public x = new A().p; // should also be ok
}
class A {
  public p = '';
}


//// [scopeCheckClassProperty.js]
var C = (function () {
    function C() {
        this.x = new A().p; // should also be ok
        new A().p; // ok
    }
    return C;
}());
var A = (function () {
    function A() {
        this.p = '';
    }
    return A;
}());
