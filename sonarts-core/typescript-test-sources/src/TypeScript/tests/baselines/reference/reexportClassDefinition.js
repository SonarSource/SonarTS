//// [tests/cases/conformance/externalModules/reexportClassDefinition.ts] ////

//// [foo1.ts]
class x{}
export = x; 

//// [foo2.ts]
import foo1 = require('./foo1');

export = {
    x: foo1
}

//// [foo3.ts]
import foo2 = require('./foo2')
class x extends foo2.x {}



//// [foo1.js]
"use strict";
var x = (function () {
    function x() {
    }
    return x;
}());
module.exports = x;
//// [foo2.js]
"use strict";
var foo1 = require("./foo1");
module.exports = {
    x: foo1
};
//// [foo3.js]
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
var foo2 = require("./foo2");
var x = (function (_super) {
    __extends(x, _super);
    function x() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return x;
}(foo2.x));
