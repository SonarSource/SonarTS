//// [functionOverloads5.ts]
class baz { 
  public foo();
  private foo(bar?:any){ }
}


//// [functionOverloads5.js]
var baz = (function () {
    function baz() {
    }
    baz.prototype.foo = function (bar) { };
    return baz;
}());
