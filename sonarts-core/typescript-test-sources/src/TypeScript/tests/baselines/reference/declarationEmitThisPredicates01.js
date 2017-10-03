//// [declarationEmitThisPredicates01.ts]
export class C {
    m(): this is D {
        return this instanceof D;
    }
}

export class D extends C {
}

//// [declarationEmitThisPredicates01.js]
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var C = (function () {
    function C() {
    }
    C.prototype.m = function () {
        return this instanceof D;
    };
    return C;
}());
exports.C = C;
var D = (function (_super) {
    __extends(D, _super);
    function D() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return D;
}(C));
exports.D = D;


//// [declarationEmitThisPredicates01.d.ts]
export declare class C {
    m(): this is D;
}
export declare class D extends C {
}
