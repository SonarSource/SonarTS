//// [file.tsx]
import React = require('react');

class BigGreeter extends React.Component<{ }, {}> {
    render() {
        return <div>Default hi</div>;
    }
    greeting: string;
}

// Error
let a = <BigGreeter prop1="hello" />

// OK
let b = <BigGreeter ref={(input) => { this.textInput = input; }} />
let c = <BigGreeter data-extra="hi" />

//// [file.jsx]
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
var _this = this;
exports.__esModule = true;
var React = require("react");
var BigGreeter = (function (_super) {
    __extends(BigGreeter, _super);
    function BigGreeter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BigGreeter.prototype.render = function () {
        return <div>Default hi</div>;
    };
    return BigGreeter;
}(React.Component));
// Error
var a = <BigGreeter prop1="hello"/>;
// OK
var b = <BigGreeter ref={function (input) { _this.textInput = input; }}/>;
var c = <BigGreeter data-extra="hi"/>;
