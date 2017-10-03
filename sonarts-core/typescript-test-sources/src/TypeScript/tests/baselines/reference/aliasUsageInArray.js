//// [tests/cases/compiler/aliasUsageInArray.ts] ////

//// [aliasUsageInArray_backbone.ts]
export class Model {
    public someData: string;
}

//// [aliasUsageInArray_moduleA.ts]
import Backbone = require("./aliasUsageInArray_backbone");
export class VisualizationModel extends Backbone.Model {
    // interesting stuff here
}

//// [aliasUsageInArray_main.ts]
import Backbone = require("./aliasUsageInArray_backbone");
import moduleA = require("./aliasUsageInArray_moduleA");
interface IHasVisualizationModel {
    VisualizationModel: typeof Backbone.Model;
}

var xs: IHasVisualizationModel[] = [moduleA];
var xs2: typeof moduleA[] = [moduleA];

//// [aliasUsageInArray_backbone.js]
"use strict";
exports.__esModule = true;
var Model = (function () {
    function Model() {
    }
    return Model;
}());
exports.Model = Model;
//// [aliasUsageInArray_moduleA.js]
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
var Backbone = require("./aliasUsageInArray_backbone");
var VisualizationModel = (function (_super) {
    __extends(VisualizationModel, _super);
    function VisualizationModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VisualizationModel;
}(Backbone.Model));
exports.VisualizationModel = VisualizationModel;
//// [aliasUsageInArray_main.js]
"use strict";
exports.__esModule = true;
var moduleA = require("./aliasUsageInArray_moduleA");
var xs = [moduleA];
var xs2 = [moduleA];
