//// [declarationEmitExpressionInExtends5.ts]
namespace Test
{
	export interface IFace
	{
	}

	export class SomeClass implements IFace
	{
	}

	export class Derived extends getClass<IFace>()
	{
	}

	export function getClass<T>() : new() => T
	{
		return SomeClass as (new() => T);
	}
}


//// [declarationEmitExpressionInExtends5.js]
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
var Test;
(function (Test) {
    var SomeClass = (function () {
        function SomeClass() {
        }
        return SomeClass;
    }());
    Test.SomeClass = SomeClass;
    var Derived = (function (_super) {
        __extends(Derived, _super);
        function Derived() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Derived;
    }(getClass()));
    Test.Derived = Derived;
    function getClass() {
        return SomeClass;
    }
    Test.getClass = getClass;
})(Test || (Test = {}));


//// [declarationEmitExpressionInExtends5.d.ts]
declare namespace Test {
    interface IFace {
    }
    class SomeClass implements IFace {
    }
    const Derived_base: new () => IFace;
    class Derived extends Derived_base {
    }
    function getClass<T>(): new () => T;
}
