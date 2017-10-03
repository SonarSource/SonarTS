//// [file.tsx]
import React = require('react');

class RC1 extends React.Component<{x : number}, {}> {
    render() {
        return null;
    }
}

class RC2 extends React.Component<{ x: string }, {}> {
    render() {
        return null;
    }
    private method() { }
}

class RC3 extends React.Component<{}, {}> {
    render() {
        return null;
    }
}

class RC4 extends React.Component<{}, {}> {
    render() {
        return null;
    }
}

var RCComp = RC1 || RC2;
var EmptyRCComp = RC3 || RC4;
var PartRCComp = RC1 || RC4;
// Error
let a = <RCComp x />;
let b = <PartRCComp x={10} />
let c = <EmptyRCComp prop />;


//// [file.js]
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
var RC1 = (function (_super) {
    __extends(RC1, _super);
    function RC1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RC1.prototype.render = function () {
        return null;
    };
    return RC1;
}(React.Component));
var RC2 = (function (_super) {
    __extends(RC2, _super);
    function RC2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RC2.prototype.render = function () {
        return null;
    };
    RC2.prototype.method = function () { };
    return RC2;
}(React.Component));
var RC3 = (function (_super) {
    __extends(RC3, _super);
    function RC3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RC3.prototype.render = function () {
        return null;
    };
    return RC3;
}(React.Component));
var RC4 = (function (_super) {
    __extends(RC4, _super);
    function RC4() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RC4.prototype.render = function () {
        return null;
    };
    return RC4;
}(React.Component));
var RCComp = RC1 || RC2;
var EmptyRCComp = RC3 || RC4;
var PartRCComp = RC1 || RC4;
// Error
var a = React.createElement(RCComp, { x: true });
var b = React.createElement(PartRCComp, { x: 10 });
var c = React.createElement(EmptyRCComp, { prop: true });
