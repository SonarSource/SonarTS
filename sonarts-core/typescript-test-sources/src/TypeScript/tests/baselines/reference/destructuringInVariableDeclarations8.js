//// [destructuringInVariableDeclarations8.ts]
let { toString } = 1;
{
    let { toFixed } = 1;
}
export {};


//// [destructuringInVariableDeclarations8.js]
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var toString;
    return {
        setters: [],
        execute: function () {
            toString = 1..toString;
            {
                let { toFixed } = 1;
            }
        }
    };
});
