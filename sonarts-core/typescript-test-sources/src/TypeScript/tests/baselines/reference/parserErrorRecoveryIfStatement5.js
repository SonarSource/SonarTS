//// [parserErrorRecoveryIfStatement5.ts]
class Foo {
  f1() {
    if (a.b) {
  }
  f2() {
  }
  f3() {
  }
}

//// [parserErrorRecoveryIfStatement5.js]
var Foo = (function () {
    function Foo() {
    }
    Foo.prototype.f1 = function () {
        if (a.b) {
        }
        f2();
        {
        }
        f3();
        {
        }
    };
    return Foo;
}());
