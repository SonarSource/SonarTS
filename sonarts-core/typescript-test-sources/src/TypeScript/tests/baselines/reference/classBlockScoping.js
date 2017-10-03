//// [classBlockScoping.ts]
function f(b: boolean) {
  let Foo: any;
  if (b) {
    Foo = class Foo {
      static y = new Foo();

      static x() {
        new Foo();
      }

      m() {
        new Foo();
      }
    };

    new Foo();
  }
  else {
    class Foo {
      static y = new Foo();

      static x() {
        new Foo();
      }

      m() {
        new Foo();
      }
    }

    new Foo();
  }
}

//// [classBlockScoping.js]
function f(b) {
    var Foo;
    if (b) {
        Foo = (_a = (function () {
                function Foo() {
                }
                Foo.x = function () {
                    new Foo();
                };
                Foo.prototype.m = function () {
                    new Foo();
                };
                return Foo;
            }()),
            _a.y = new _a(),
            _a);
        new Foo();
    }
    else {
        var Foo_1 = (function () {
            function Foo() {
            }
            Foo.x = function () {
                new Foo();
            };
            Foo.prototype.m = function () {
                new Foo();
            };
            return Foo;
        }());
        Foo_1.y = new Foo_1();
        new Foo_1();
    }
    var _a;
}
