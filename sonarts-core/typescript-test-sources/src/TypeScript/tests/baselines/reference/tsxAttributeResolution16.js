//// [file.tsx]
import React = require('react');

interface Address {
  street: string;
  country: string;
}

interface CanadianAddress extends Address {
    postalCode: string;
}

interface AmericanAddress extends Address {
    zipCode: string;
}

type Properties = CanadianAddress | AmericanAddress;

export class AddressComp extends React.Component<Properties, void> {
  public render() {
    return null;
  }
}

let a = <AddressComp postalCode='T1B 0L3' street="vancouver" country="CA" />

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
var AddressComp = (function (_super) {
    __extends(AddressComp, _super);
    function AddressComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddressComp.prototype.render = function () {
        return null;
    };
    return AddressComp;
}(React.Component));
exports.AddressComp = AddressComp;
var a = <AddressComp postalCode='T1B 0L3' street="vancouver" country="CA"/>;
