//// [symbolProperty57.ts]
var obj = {
    [Symbol.iterator]: 0
};

// Should give type 'any'.
obj[Symbol["nonsense"]];

//// [symbolProperty57.js]
var obj = {
    [Symbol.iterator]: 0
};
// Should give type 'any'.
obj[Symbol["nonsense"]];
