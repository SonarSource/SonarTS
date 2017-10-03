//// [derivedClasses.ts]
class Red extends Color {
    public shade() { 
    	var getHue = () => { return this.hue(); };
    	return getHue() + " red"; 
    }
}

class Color {
    public shade() { return "some shade"; }
    public hue() { return "some hue"; }
}

class Blue extends Color {
    
    public shade() { 
    	var getHue = () => { return this.hue(); };
    	return getHue() + " blue"; 
    }
}

var r = new Red();
var b = new Blue();

r.shade();
r.hue();
b.shade();
b.hue();




//// [derivedClasses.js]
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
var Red = (function (_super) {
    __extends(Red, _super);
    function Red() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Red.prototype.shade = function () {
        var _this = this;
        var getHue = function () { return _this.hue(); };
        return getHue() + " red";
    };
    return Red;
}(Color));
var Color = (function () {
    function Color() {
    }
    Color.prototype.shade = function () { return "some shade"; };
    Color.prototype.hue = function () { return "some hue"; };
    return Color;
}());
var Blue = (function (_super) {
    __extends(Blue, _super);
    function Blue() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Blue.prototype.shade = function () {
        var _this = this;
        var getHue = function () { return _this.hue(); };
        return getHue() + " blue";
    };
    return Blue;
}(Color));
var r = new Red();
var b = new Blue();
r.shade();
r.hue();
b.shade();
b.hue();
