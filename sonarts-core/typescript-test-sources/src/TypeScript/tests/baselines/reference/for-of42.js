//// [for-of42.ts]
var array = [{ x: "", y: 0 }]
for (var {x: a, y: b} of array) {
    a;
    b;
}

//// [for-of42.js]
var array = [{ x: "", y: 0 }];
for (var { x: a, y: b } of array) {
    a;
    b;
}
