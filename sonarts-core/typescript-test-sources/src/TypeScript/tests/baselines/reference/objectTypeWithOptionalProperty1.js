//// [objectTypeWithOptionalProperty1.ts]
    var b = {
        x?: 1 // error
    }

//// [objectTypeWithOptionalProperty1.js]
var b = {
    x: 1 // error
};
