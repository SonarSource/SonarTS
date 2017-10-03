//// [file.tsx]
import React = require('react');

interface ButtonProp {
    a: number,
    b: string,
    children: Button;
}

class Button extends React.Component<ButtonProp, any> {
    render() {
        // Error children are specified twice
        return (<InnerButton {...this.props} children="hi">
            <div>Hello World</div>
            </InnerButton>);
    }
}

interface InnerButtonProp {
	a: number
}

class InnerButton extends React.Component<InnerButtonProp, any> {
	render() {
		return (<button>Hello</button>);
	}
}


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
exports.__esModule = true;
var React = require("react");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        // Error children are specified twice
        return (<InnerButton {...this.props} children="hi">
            <div>Hello World</div>
            </InnerButton>);
    };
    return Button;
}(React.Component));
var InnerButton = (function (_super) {
    __extends(InnerButton, _super);
    function InnerButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InnerButton.prototype.render = function () {
        return (<button>Hello</button>);
    };
    return InnerButton;
}(React.Component));
