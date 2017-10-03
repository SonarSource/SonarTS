//// [tests/cases/compiler/importHelpersAmd.ts] ////

//// [a.ts]
export class A { }

//// [b.ts]
import { A } from "./a";
export class B extends A { }

//// [tslib.d.ts]
export declare function __extends(d: Function, b: Function): void;
export declare function __assign(t: any, ...sources: any[]): any;
export declare function __decorate(decorators: Function[], target: any, key?: string | symbol, desc?: any): any;
export declare function __param(paramIndex: number, decorator: Function): Function;
export declare function __metadata(metadataKey: any, metadataValue: any): Function;
export declare function __awaiter(thisArg: any, _arguments: any, P: Function, generator: Function): any;


//// [a.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var A = (function () {
        function A() {
        }
        return A;
    }());
    exports.A = A;
});
//// [b.js]
define(["require", "exports", "tslib", "./a"], function (require, exports, tslib_1, a_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var B = (function (_super) {
        tslib_1.__extends(B, _super);
        function B() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return B;
    }(a_1.A));
    exports.B = B;
});
