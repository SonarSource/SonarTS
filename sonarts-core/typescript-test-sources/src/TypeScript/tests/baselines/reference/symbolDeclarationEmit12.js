//// [symbolDeclarationEmit12.ts]
module M {
    interface I { }
    export class C {
        [Symbol.iterator]: I;
        [Symbol.toPrimitive](x: I) { }
        [Symbol.isConcatSpreadable](): I {
            return undefined
        }
        get [Symbol.toPrimitive]() { return undefined; }
        set [Symbol.toPrimitive](x: I) { }
    }
}

//// [symbolDeclarationEmit12.js]
var M;
(function (M) {
    class C {
        [Symbol.toPrimitive](x) { }
        [Symbol.isConcatSpreadable]() {
            return undefined;
        }
        get [Symbol.toPrimitive]() { return undefined; }
        set [Symbol.toPrimitive](x) { }
    }
    M.C = C;
})(M || (M = {}));
