//// [es6ModuleWithModuleGenTargetCommonjs.ts]
export class A
{
    constructor ()
    {
    }

    public B()
    {
        return 42;
    }
}

//// [es6ModuleWithModuleGenTargetCommonjs.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
    constructor() {
    }
    B() {
        return 42;
    }
}
exports.A = A;
