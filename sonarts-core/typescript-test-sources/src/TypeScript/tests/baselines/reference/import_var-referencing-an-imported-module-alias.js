//// [tests/cases/compiler/import_var-referencing-an-imported-module-alias.ts] ////

//// [host.ts]
export class Host { }

//// [consumer.ts]
import host = require("host");
var hostVar = host;
var v = new hostVar.Host();
 

//// [host.js]
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Host = (function () {
        function Host() {
        }
        return Host;
    }());
    exports.Host = Host;
});
//// [consumer.js]
define(["require", "exports", "host"], function (require, exports, host) {
    "use strict";
    exports.__esModule = true;
    var hostVar = host;
    var v = new hostVar.Host();
});
