//// [classSideInheritance2.ts]
interface IText {
    foo: number;
}

interface TextSpan {}

class SubText extends TextBase {

        constructor(text: IText, span: TextSpan) {
            super();
        }
}

class TextBase implements IText {
        public foo: number;
        public subText(span: TextSpan): IText {

            return new SubText(this, span);
        }
}

//// [classSideInheritance2.js]
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
var SubText = (function (_super) {
    __extends(SubText, _super);
    function SubText(text, span) {
        return _super.call(this) || this;
    }
    return SubText;
}(TextBase));
var TextBase = (function () {
    function TextBase() {
    }
    TextBase.prototype.subText = function (span) {
        return new SubText(this, span);
    };
    return TextBase;
}());
