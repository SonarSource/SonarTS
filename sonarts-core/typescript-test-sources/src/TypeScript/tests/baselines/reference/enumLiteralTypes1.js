//// [enumLiteralTypes1.ts]
const enum Choice { Unknown, Yes, No };

type YesNo = Choice.Yes | Choice.No;
type NoYes = Choice.No | Choice.Yes;
type UnknownYesNo = Choice.Unknown | Choice.Yes | Choice.No;

function f1() {
    var a: YesNo;
    var a: NoYes;
    var a: Choice.Yes | Choice.No;
    var a: Choice.No | Choice.Yes;
}

function f2(a: YesNo, b: UnknownYesNo, c: Choice) {
    b = a;
    c = a;
    c = b;
}

function f3(a: Choice.Yes, b: YesNo) {
    var x = a + b;
    var x = a - b;
    var x = a * b;
    var x = a / b;
    var x = a % b;
    var x = a | b;
    var x = a & b;
    var x = a ^ b;
    var x = -b;
    var x = ~b;
    var y = a == b;
    var y = a != b;
    var y = a === b;
    var y = a !== b;
    var y = a > b;
    var y = a < b;
    var y = a >= b;
    var y = a <= b;
    var y = !b;
}

function f4(a: Choice.Yes, b: YesNo) {
    a++;
    b++;
}

declare function g(x: Choice.Yes): string;
declare function g(x: Choice.No): boolean;
declare function g(x: Choice): number;

function f5(a: YesNo, b: UnknownYesNo, c: Choice) {
    var z1 = g(Choice.Yes);
    var z2 = g(Choice.No);
    var z3 = g(a);
    var z4 = g(b);
    var z5 = g(c);
}

function assertNever(x: never): never {
    throw new Error("Unexpected value");
}

function f10(x: YesNo) {
    switch (x) {
        case Choice.Yes: return "true";
        case Choice.No: return "false";
    }
}

function f11(x: YesNo) {
    switch (x) {
        case Choice.Yes: return "true";
        case Choice.No: return "false";
    }
    return assertNever(x);
}

function f12(x: UnknownYesNo) {
    if (x) {
        x;
    }
    else {
        x;
    }
}

function f13(x: UnknownYesNo) {
    if (x === Choice.Yes) {
        x;
    }
    else {
        x;
    }
}

type Item =
    { kind: Choice.Yes, a: string } |
    { kind: Choice.No, b: string };

function f20(x: Item) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
}

function f21(x: Item) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
    return assertNever(x);
}

//// [enumLiteralTypes1.js]
;
function f1() {
    var a;
    var a;
    var a;
    var a;
}
function f2(a, b, c) {
    b = a;
    c = a;
    c = b;
}
function f3(a, b) {
    var x = a + b;
    var x = a - b;
    var x = a * b;
    var x = a / b;
    var x = a % b;
    var x = a | b;
    var x = a & b;
    var x = a ^ b;
    var x = -b;
    var x = ~b;
    var y = a == b;
    var y = a != b;
    var y = a === b;
    var y = a !== b;
    var y = a > b;
    var y = a < b;
    var y = a >= b;
    var y = a <= b;
    var y = !b;
}
function f4(a, b) {
    a++;
    b++;
}
function f5(a, b, c) {
    var z1 = g(1 /* Yes */);
    var z2 = g(2 /* No */);
    var z3 = g(a);
    var z4 = g(b);
    var z5 = g(c);
}
function assertNever(x) {
    throw new Error("Unexpected value");
}
function f10(x) {
    switch (x) {
        case 1 /* Yes */: return "true";
        case 2 /* No */: return "false";
    }
}
function f11(x) {
    switch (x) {
        case 1 /* Yes */: return "true";
        case 2 /* No */: return "false";
    }
    return assertNever(x);
}
function f12(x) {
    if (x) {
        x;
    }
    else {
        x;
    }
}
function f13(x) {
    if (x === 1 /* Yes */) {
        x;
    }
    else {
        x;
    }
}
function f20(x) {
    switch (x.kind) {
        case 1 /* Yes */: return x.a;
        case 2 /* No */: return x.b;
    }
}
function f21(x) {
    switch (x.kind) {
        case 1 /* Yes */: return x.a;
        case 2 /* No */: return x.b;
    }
    return assertNever(x);
}
