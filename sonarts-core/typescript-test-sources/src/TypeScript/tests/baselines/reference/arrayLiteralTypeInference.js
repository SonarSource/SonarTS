//// [arrayLiteralTypeInference.ts]
class Action {
    id: number;
}

class ActionA extends Action {
    value: string;
}

class ActionB extends Action {
    trueNess: boolean;
}

var x1: Action[] = [
    { id: 2, trueness: false },
    { id: 3, name: "three" }
]

var x2: Action[] = [
    new ActionA(),
    new ActionB()
]

var x3: Action[] = [
    new Action(),
    new ActionA(),
    new ActionB()
]

var z1: { id: number }[] =
    [
        { id: 2, trueness: false },
        { id: 3, name: "three" }
    ]

var z2: { id: number }[] =
    [
        new ActionA(),
        new ActionB()
    ]

var z3: { id: number }[] =
    [
        new Action(),
        new ActionA(),
        new ActionB()
    ]






//// [arrayLiteralTypeInference.js]
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
var Action = (function () {
    function Action() {
    }
    return Action;
}());
var ActionA = (function (_super) {
    __extends(ActionA, _super);
    function ActionA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActionA;
}(Action));
var ActionB = (function (_super) {
    __extends(ActionB, _super);
    function ActionB() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActionB;
}(Action));
var x1 = [
    { id: 2, trueness: false },
    { id: 3, name: "three" }
];
var x2 = [
    new ActionA(),
    new ActionB()
];
var x3 = [
    new Action(),
    new ActionA(),
    new ActionB()
];
var z1 = [
    { id: 2, trueness: false },
    { id: 3, name: "three" }
];
var z2 = [
    new ActionA(),
    new ActionB()
];
var z3 = [
    new Action(),
    new ActionA(),
    new ActionB()
];
