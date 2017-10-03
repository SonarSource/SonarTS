//// [commentsDottedModuleName.ts]
/** this is multi declare module*/
export module outerModule.InnerModule {
    /// class b comment
    export class b {
    }
}

//// [commentsDottedModuleName.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** this is multi declare module*/
    var outerModule;
    (function (outerModule) {
        var InnerModule;
        (function (InnerModule) {
            /// class b comment
            var b = (function () {
                function b() {
                }
                return b;
            }());
            InnerModule.b = b;
        })(InnerModule = outerModule.InnerModule || (outerModule.InnerModule = {}));
    })(outerModule = exports.outerModule || (exports.outerModule = {}));
});


//// [commentsDottedModuleName.d.ts]
/** this is multi declare module*/
export declare module outerModule.InnerModule {
    class b {
    }
}
