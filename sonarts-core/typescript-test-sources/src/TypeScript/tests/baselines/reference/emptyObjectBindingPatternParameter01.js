//// [emptyObjectBindingPatternParameter01.ts]
function f({}) {
    var x, y, z;
}

//// [emptyObjectBindingPatternParameter01.js]
function f(_a) {
    var x, y, z;
}


//// [emptyObjectBindingPatternParameter01.d.ts]
declare function f({}: {}): void;
