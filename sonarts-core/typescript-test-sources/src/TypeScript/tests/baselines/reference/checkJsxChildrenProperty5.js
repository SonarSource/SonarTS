//// [file.tsx]
import React = require('react');

interface Prop {
    a: number,
    b: string,
    children: Button;
}

class Button extends React.Component<any, any> {
    render() {
        return (<div>My Button</div>)
    }
}

function Comp(p: Prop) {
    return <div>{p.b}</div>;
}

// Error: no children specified
let k = <Comp a={10} b="hi" />;

// Error: JSX.element is not the same as JSX.ElementClass
let k1 =
    <Comp a={10} b="hi">
        <Button />
    </Comp>;
let k2 =
    <Comp a={10} b="hi">
        {Button}
    </Comp>;

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
        return (<div>My Button</div>);
    };
    return Button;
}(React.Component));
function Comp(p) {
    return <div>{p.b}</div>;
}
// Error: no children specified
var k = <Comp a={10} b="hi"/>;
// Error: JSX.element is not the same as JSX.ElementClass
var k1 = <Comp a={10} b="hi">
        <Button />
    </Comp>;
var k2 = <Comp a={10} b="hi">
        {Button}
    </Comp>;
