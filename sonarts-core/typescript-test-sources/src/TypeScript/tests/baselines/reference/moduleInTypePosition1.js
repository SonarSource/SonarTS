//// [tests/cases/compiler/moduleInTypePosition1.ts] ////

//// [moduleInTypePosition1_0.ts]
export class Promise {
    foo: string;
}

//// [moduleInTypePosition1_1.ts]
///<reference path='moduleInTypePosition1_0.ts'/>
import WinJS = require('./moduleInTypePosition1_0');
var x = (w1: WinJS) => { };


//// [moduleInTypePosition1_0.js]
"use strict";
exports.__esModule = true;
var Promise = (function () {
    function Promise() {
    }
    return Promise;
}());
exports.Promise = Promise;
//// [moduleInTypePosition1_1.js]
"use strict";
exports.__esModule = true;
var x = function (w1) { };
