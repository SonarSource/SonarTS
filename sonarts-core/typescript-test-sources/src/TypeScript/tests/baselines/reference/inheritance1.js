//// [inheritance1.ts]
class Control {
    private state: any;
}
interface SelectableControl extends Control {
    select(): void;
}

class Button extends Control implements SelectableControl {
    select() { }
}
class TextBox extends Control {
    select() { }
}
class ImageBase extends Control implements SelectableControl{
}
class Image1 extends Control {
}
class Locations implements SelectableControl {
    select() { }
}
class Locations1 {
    select() { }
}
var sc: SelectableControl;
var c: Control;

var b: Button;
sc = b;
c = b;
b = sc;
b = c;

var t: TextBox;
sc = t;
c = t;
t = sc;
t = c;

var i: ImageBase;
sc = i;
c = i;
i = sc;
i = c;

var i1: Image1;
sc = i1;
c = i1;
i1 = sc;
i1 = c;

var l: Locations;
sc = l;
c = l;
l = sc;
l = c;

var l1: Locations1;
sc = l1;
c = l1;
l1 = sc;
l1 = c;

//// [inheritance1.js]
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
var Control = (function () {
    function Control() {
    }
    return Control;
}());
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.select = function () { };
    return Button;
}(Control));
var TextBox = (function (_super) {
    __extends(TextBox, _super);
    function TextBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextBox.prototype.select = function () { };
    return TextBox;
}(Control));
var ImageBase = (function (_super) {
    __extends(ImageBase, _super);
    function ImageBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ImageBase;
}(Control));
var Image1 = (function (_super) {
    __extends(Image1, _super);
    function Image1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Image1;
}(Control));
var Locations = (function () {
    function Locations() {
    }
    Locations.prototype.select = function () { };
    return Locations;
}());
var Locations1 = (function () {
    function Locations1() {
    }
    Locations1.prototype.select = function () { };
    return Locations1;
}());
var sc;
var c;
var b;
sc = b;
c = b;
b = sc;
b = c;
var t;
sc = t;
c = t;
t = sc;
t = c;
var i;
sc = i;
c = i;
i = sc;
i = c;
var i1;
sc = i1;
c = i1;
i1 = sc;
i1 = c;
var l;
sc = l;
c = l;
l = sc;
l = c;
var l1;
sc = l1;
c = l1;
l1 = sc;
l1 = c;
