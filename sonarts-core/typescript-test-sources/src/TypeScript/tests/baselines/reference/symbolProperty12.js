//// [symbolProperty12.ts]
class C {
    private [Symbol.iterator]: { x };
}
interface I {
    [Symbol.iterator]: { x };
}

var i: I;
i = new C;
var c: C = i;

//// [symbolProperty12.js]
class C {
}
var i;
i = new C;
var c = i;
