//// [collisionExportsRequireAndFunction.ts]
export function exports() {
    return 1;
}
export function require() {
    return "require";
}
module m1 {
    function exports() {
        return 1;
    }
    function require() {
        return "require";
    }
}
module m2 {
    export function exports() {
        return 1;
    }
    export function require() {
        return "require";
    }
}

//// [collisionExportsRequireAndFunction.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function exports() {
        return 1;
    }
    exports.exports = exports;
    function require() {
        return "require";
    }
    exports.require = require;
    var m1;
    (function (m1) {
        function exports() {
            return 1;
        }
        function require() {
            return "require";
        }
    })(m1 || (m1 = {}));
    var m2;
    (function (m2) {
        function exports() {
            return 1;
        }
        m2.exports = exports;
        function require() {
            return "require";
        }
        m2.require = require;
    })(m2 || (m2 = {}));
});
