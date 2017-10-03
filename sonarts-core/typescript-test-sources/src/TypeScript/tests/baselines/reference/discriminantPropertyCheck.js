//// [discriminantPropertyCheck.ts]
type Item = Item1 | Item2;

interface Base {
    bar: boolean;
}

interface Item1 extends Base {
    kind: "A";
    foo: string | undefined;
    baz: boolean;
    qux: true;
}

interface Item2 extends Base {
    kind: "B";
    foo: string | undefined;
    baz: boolean;
    qux: false;
}

function goo1(x: Item) {
    if (x.kind === "A" && x.foo !== undefined) {
        x.foo.length;
    }
}

function goo2(x: Item) {
    if (x.foo !== undefined && x.kind === "A") {
        x.foo.length;  // Error, intervening discriminant guard
    }
}

function foo1(x: Item) {
    if (x.bar && x.foo !== undefined) {
        x.foo.length;
    }
}

function foo2(x: Item) {
    if (x.foo !== undefined && x.bar) {
        x.foo.length;
    }
}

function foo3(x: Item) {
    if (x.baz && x.foo !== undefined) {
        x.foo.length;
    }
}

function foo4(x: Item) {
    if (x.foo !== undefined && x.baz) {
        x.foo.length;
    }
}

function foo5(x: Item) {
    if (x.qux && x.foo !== undefined) {
        x.foo.length;
    }
}

function foo6(x: Item) {
    if (x.foo !== undefined && x.qux) {
        x.foo.length;  // Error, intervening discriminant guard
    }
}

//// [discriminantPropertyCheck.js]
function goo1(x) {
    if (x.kind === "A" && x.foo !== undefined) {
        x.foo.length;
    }
}
function goo2(x) {
    if (x.foo !== undefined && x.kind === "A") {
        x.foo.length; // Error, intervening discriminant guard
    }
}
function foo1(x) {
    if (x.bar && x.foo !== undefined) {
        x.foo.length;
    }
}
function foo2(x) {
    if (x.foo !== undefined && x.bar) {
        x.foo.length;
    }
}
function foo3(x) {
    if (x.baz && x.foo !== undefined) {
        x.foo.length;
    }
}
function foo4(x) {
    if (x.foo !== undefined && x.baz) {
        x.foo.length;
    }
}
function foo5(x) {
    if (x.qux && x.foo !== undefined) {
        x.foo.length;
    }
}
function foo6(x) {
    if (x.foo !== undefined && x.qux) {
        x.foo.length; // Error, intervening discriminant guard
    }
}
