//// [tests/cases/compiler/importHelpersNoHelpersForAsyncGenerators.ts] ////

//// [main.ts]
export async function * f() {
    await 1;
    yield 2;
    yield* [3];
}

//// [tslib.d.ts]
export {}


//// [main.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
function f() {
    return tslib_1.__asyncGenerator(this, arguments, function f_1() {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tslib_1.__await(1)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, 2];
                case 2:
                    _a.sent();
                    return [5 /*yield**/, tslib_1.__values(tslib_1.__asyncDelegator(tslib_1.__asyncValues([3])))];
                case 3: return [4 /*yield*/, tslib_1.__await.apply(void 0, [_a.sent()])];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.f = f;
