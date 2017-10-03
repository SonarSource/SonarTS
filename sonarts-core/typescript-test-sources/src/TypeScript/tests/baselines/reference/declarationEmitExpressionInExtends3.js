//// [declarationEmitExpressionInExtends3.ts]
export class ExportedClass<T> {
	x: T;
}

class LocalClass<T, U> {
    x: T;
    y: U;
}

export interface ExportedInterface {
    x: number;
}

interface LocalInterface {
    x: number;
}

function getLocalClass<T>(c: T) {
    return LocalClass;
}

function getExportedClass<T>(c: T) {
    return ExportedClass;
}



export class MyClass extends getLocalClass<LocalInterface>(undefined)<string, number> { // error LocalClass is inaccisible
}


export class MyClass2 extends getExportedClass<LocalInterface>(undefined)<string> { // OK
}


export class MyClass3 extends getExportedClass<LocalInterface>(undefined)<LocalInterface> { // Error LocalInterface is inaccisble
}


export class MyClass4 extends getExportedClass<LocalInterface>(undefined)<ExportedInterface> { // OK
}


//// [declarationEmitExpressionInExtends3.js]
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
var ExportedClass = (function () {
    function ExportedClass() {
    }
    return ExportedClass;
}());
exports.ExportedClass = ExportedClass;
var LocalClass = (function () {
    function LocalClass() {
    }
    return LocalClass;
}());
function getLocalClass(c) {
    return LocalClass;
}
function getExportedClass(c) {
    return ExportedClass;
}
var MyClass = (function (_super) {
    __extends(MyClass, _super);
    function MyClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyClass;
}(getLocalClass(undefined)));
exports.MyClass = MyClass;
var MyClass2 = (function (_super) {
    __extends(MyClass2, _super);
    function MyClass2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyClass2;
}(getExportedClass(undefined)));
exports.MyClass2 = MyClass2;
var MyClass3 = (function (_super) {
    __extends(MyClass3, _super);
    function MyClass3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyClass3;
}(getExportedClass(undefined)));
exports.MyClass3 = MyClass3;
var MyClass4 = (function (_super) {
    __extends(MyClass4, _super);
    function MyClass4() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MyClass4;
}(getExportedClass(undefined)));
exports.MyClass4 = MyClass4;
