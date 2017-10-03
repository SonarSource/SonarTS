//// [subSubClassCanAccessProtectedConstructor.ts]
class Base {
    protected constructor() { }
    public instance1 = new Base(); // allowed
}

class Subclass extends Base {
    public instance1_1 = new Base(); // allowed
    public instance1_2 = new Subclass(); // allowed
}

class SubclassOfSubclass extends Subclass {
    public instance2_1 = new Base(); // allowed
    public instance2_2 = new Subclass(); // allowed
    public instance2_3 = new SubclassOfSubclass(); // allowed
}


//// [subSubClassCanAccessProtectedConstructor.js]
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
var Base = (function () {
    function Base() {
        this.instance1 = new Base(); // allowed
    }
    return Base;
}());
var Subclass = (function (_super) {
    __extends(Subclass, _super);
    function Subclass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.instance1_1 = new Base(); // allowed
        _this.instance1_2 = new Subclass(); // allowed
        return _this;
    }
    return Subclass;
}(Base));
var SubclassOfSubclass = (function (_super) {
    __extends(SubclassOfSubclass, _super);
    function SubclassOfSubclass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.instance2_1 = new Base(); // allowed
        _this.instance2_2 = new Subclass(); // allowed
        _this.instance2_3 = new SubclassOfSubclass(); // allowed
        return _this;
    }
    return SubclassOfSubclass;
}(Subclass));
