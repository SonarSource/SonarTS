//// [file.tsx]
import React = require('react');

interface Prop {
    a: number,
    b: string
}

declare class MyComp<P = Prop> extends React.Component<P, {}> {
    internalProp: P;
}

// Error
let x = <MyComp />
let x1 = <MyComp a="hi"/>

//// [file.jsx]
"use strict";
exports.__esModule = true;
var React = require("react");
// Error
var x = <MyComp />;
var x1 = <MyComp a="hi"/>;
