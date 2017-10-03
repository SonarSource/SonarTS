//// [typeParameterAssignmentCompat1.ts]
interface Foo<T> {
    frobble(value: T): T;
}

function f<T, U>(): Foo<U> {
    var x: Foo<T>;
    var y: Foo<U>;
    x = y; // should be an error
    return x;
}

class C<T> {
    f<U>(): Foo<U> {
        var x: Foo<T>;
        var y: Foo<U>;
        x = y; // should be an error
        return x;
    }
}

//// [typeParameterAssignmentCompat1.js]
function f() {
    var x;
    var y;
    x = y; // should be an error
    return x;
}
var C = (function () {
    function C() {
    }
    C.prototype.f = function () {
        var x;
        var y;
        x = y; // should be an error
        return x;
    };
    return C;
}());
