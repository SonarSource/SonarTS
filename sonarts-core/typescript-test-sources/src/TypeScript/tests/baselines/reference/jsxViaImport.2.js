//// [tests/cases/compiler/jsxViaImport.2.tsx] ////

//// [component.d.ts]
declare module JSX {
  interface ElementAttributesProperty { props; }
}
declare module React {
  class Component<T, U> { }
}
declare module "BaseComponent" {
    export default class extends React.Component<any, {}> {
    }
}

//// [consumer.tsx]
/// <reference path="component.d.ts" />
import BaseComponent from 'BaseComponent';
class TestComponent extends React.Component<any, {}> {
    render() {
        return <BaseComponent />;
    }
}


//// [consumer.jsx]
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
/// <reference path="component.d.ts" />
var BaseComponent_1 = require("BaseComponent");
var TestComponent = (function (_super) {
    __extends(TestComponent, _super);
    function TestComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestComponent.prototype.render = function () {
        return <BaseComponent_1.default />;
    };
    return TestComponent;
}(React.Component));
