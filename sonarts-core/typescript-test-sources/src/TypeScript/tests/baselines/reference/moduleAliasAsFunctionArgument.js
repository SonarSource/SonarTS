//// [tests/cases/compiler/moduleAliasAsFunctionArgument.ts] ////

//// [moduleAliasAsFunctionArgument_0.ts]
export var x: number;

//// [moduleAliasAsFunctionArgument_1.ts]
///<reference path='moduleAliasAsFunctionArgument_0.ts'/>
import a = require('moduleAliasAsFunctionArgument_0');

function fn(arg: { x: number }) {
}

a.x; // OK
fn(a); // Error: property 'x' is missing from 'a'


//// [moduleAliasAsFunctionArgument_0.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
});
//// [moduleAliasAsFunctionArgument_1.js]
define(["require", "exports", "moduleAliasAsFunctionArgument_0"], function (require, exports, a) {
    "use strict";
    exports.__esModule = true;
    function fn(arg) {
    }
    a.x; // OK
    fn(a); // Error: property 'x' is missing from 'a'
});
