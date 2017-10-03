//// [tests/cases/compiler/aliasAssignments.ts] ////

//// [aliasAssignments_moduleA.ts]
export class someClass {
    public someData: string;
}

//// [aliasAssignments_1.ts]
import moduleA = require("./aliasAssignments_moduleA");
var x = moduleA;
x = 1; // Should be error
var y = 1;
y = moduleA; // should be error


//// [aliasAssignments_moduleA.js]
"use strict";
exports.__esModule = true;
var someClass = (function () {
    function someClass() {
    }
    return someClass;
}());
exports.someClass = someClass;
//// [aliasAssignments_1.js]
"use strict";
exports.__esModule = true;
var moduleA = require("./aliasAssignments_moduleA");
var x = moduleA;
x = 1; // Should be error
var y = 1;
y = moduleA; // should be error
