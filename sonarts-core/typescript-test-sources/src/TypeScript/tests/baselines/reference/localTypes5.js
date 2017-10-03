//// [localTypes5.ts]
function foo<A>() {
    class X {
        m<B, C>() {
            return (function <D>() {
                class Y<E> {
                }
                return new Y<string>();
            })<Date>();
        }
    }
    var x = new X();
    return x.m<number, boolean>();
}
var x = foo<void>();


//// [localTypes5.js]
function foo() {
    var X = (function () {
        function X() {
        }
        X.prototype.m = function () {
            return (function () {
                var Y = (function () {
                    function Y() {
                    }
                    return Y;
                }());
                return new Y();
            })();
        };
        return X;
    }());
    var x = new X();
    return x.m();
}
var x = foo();
