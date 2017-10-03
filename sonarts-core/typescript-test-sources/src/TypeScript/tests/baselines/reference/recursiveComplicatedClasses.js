//// [recursiveComplicatedClasses.ts]
class Signature {
    public parameters: ParameterSymbol[] = null;
}

function aEnclosesB(a: Symbol) {
    return true;
}

class Symbol {
    public bound: boolean;
    public visible() {
        var b: TypeSymbol;
        return aEnclosesB(b);
    }

}
class InferenceSymbol extends Symbol {
}

class ParameterSymbol extends InferenceSymbol {
}

class TypeSymbol extends InferenceSymbol {
}

//// [recursiveComplicatedClasses.js]
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
var Signature = (function () {
    function Signature() {
        this.parameters = null;
    }
    return Signature;
}());
function aEnclosesB(a) {
    return true;
}
var Symbol = (function () {
    function Symbol() {
    }
    Symbol.prototype.visible = function () {
        var b;
        return aEnclosesB(b);
    };
    return Symbol;
}());
var InferenceSymbol = (function (_super) {
    __extends(InferenceSymbol, _super);
    function InferenceSymbol() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InferenceSymbol;
}(Symbol));
var ParameterSymbol = (function (_super) {
    __extends(ParameterSymbol, _super);
    function ParameterSymbol() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParameterSymbol;
}(InferenceSymbol));
var TypeSymbol = (function (_super) {
    __extends(TypeSymbol, _super);
    function TypeSymbol() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TypeSymbol;
}(InferenceSymbol));
