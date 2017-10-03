//// [instantiatedBaseTypeConstraints.ts]
interface Foo<T extends Foo<T, C>, C> {
  foo(bar: C): void;
}

class Bar implements Foo<Bar, string> {
  foo(bar: string): void {
  }
}

 


//// [instantiatedBaseTypeConstraints.js]
var Bar = (function () {
    function Bar() {
    }
    Bar.prototype.foo = function (bar) {
    };
    return Bar;
}());
