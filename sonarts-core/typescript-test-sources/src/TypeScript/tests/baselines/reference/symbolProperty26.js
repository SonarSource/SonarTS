//// [symbolProperty26.ts]
class C1 {
    [Symbol.toStringTag]() {
        return "";
    }
}

class C2 extends C1 {
    [Symbol.toStringTag]() {
        return "";
    }
}

//// [symbolProperty26.js]
class C1 {
    [Symbol.toStringTag]() {
        return "";
    }
}
class C2 extends C1 {
    [Symbol.toStringTag]() {
        return "";
    }
}
