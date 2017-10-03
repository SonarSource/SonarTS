//// [tests/cases/compiler/aliasUsageInAccessorsOfClass.ts] ////

//// [aliasUsage1_backbone.ts]
export class Model {
    public someData: string;
}

//// [aliasUsage1_moduleA.ts]
import Backbone = require("./aliasUsage1_backbone");
export class VisualizationModel extends Backbone.Model {
    // interesting stuff here
}

//// [aliasUsage1_main.ts]
import Backbone = require("./aliasUsage1_backbone");
import moduleA = require("./aliasUsage1_moduleA");
interface IHasVisualizationModel {
    VisualizationModel: typeof Backbone.Model;
}
class C2 {
    x: IHasVisualizationModel;
    get A() {
        return this.x;
    }
    set A(x) {
        x = moduleA;
    }
}

//// [aliasUsage1_backbone.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Model = (function () {
    function Model() {
    }
    return Model;
}());
exports.Model = Model;
//// [aliasUsage1_moduleA.js]
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
Object.defineProperty(exports, "__esModule", { value: true });
var Backbone = require("./aliasUsage1_backbone");
var VisualizationModel = (function (_super) {
    __extends(VisualizationModel, _super);
    function VisualizationModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VisualizationModel;
}(Backbone.Model));
exports.VisualizationModel = VisualizationModel;
//// [aliasUsage1_main.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moduleA = require("./aliasUsage1_moduleA");
var C2 = (function () {
    function C2() {
    }
    Object.defineProperty(C2.prototype, "A", {
        get: function () {
            return this.x;
        },
        set: function (x) {
            x = moduleA;
        },
        enumerable: true,
        configurable: true
    });
    return C2;
}());
