//// [tests/cases/compiler/moduleAugmentationGlobal2.ts] ////

//// [f1.ts]
export class A {};
//// [f2.ts]
// change the shape of Array<T>
import {A} from "./f1";

declare global {
    interface Array<T> {
        getCountAsString(): string;
    }
}

let x = [1];
let y = x.getCountAsString().toLowerCase();


//// [f1.js]
"use strict";
exports.__esModule = true;
var A = (function () {
    function A() {
    }
    return A;
}());
exports.A = A;
;
//// [f2.js]
"use strict";
exports.__esModule = true;
var x = [1];
var y = x.getCountAsString().toLowerCase();


//// [f1.d.ts]
export declare class A {
}
//// [f2.d.ts]
declare global  {
    interface Array<T> {
        getCountAsString(): string;
    }
}
export {};
