//// [dynamicModuleTypecheckError.ts]
export var x = 1;
 
for(var i = 0; i < 30; i++) {
 
    x = i * 1000; // should not be an error here
 
}


//// [dynamicModuleTypecheckError.js]
"use strict";
exports.__esModule = true;
exports.x = 1;
for (var i = 0; i < 30; i++) {
    exports.x = i * 1000; // should not be an error here
}
