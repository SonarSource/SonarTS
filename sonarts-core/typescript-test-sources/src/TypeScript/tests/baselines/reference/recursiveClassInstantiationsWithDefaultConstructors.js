//// [recursiveClassInstantiationsWithDefaultConstructors.ts]
module TypeScript2 {
    export class MemberName {
        public prefix: string = "";
    }
    export class MemberNameArray extends MemberName {
    }
}

var a = new TypeScript2.MemberNameArray()

//// [recursiveClassInstantiationsWithDefaultConstructors.js]
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
var TypeScript2;
(function (TypeScript2) {
    var MemberName = (function () {
        function MemberName() {
            this.prefix = "";
        }
        return MemberName;
    }());
    TypeScript2.MemberName = MemberName;
    var MemberNameArray = (function (_super) {
        __extends(MemberNameArray, _super);
        function MemberNameArray() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MemberNameArray;
    }(MemberName));
    TypeScript2.MemberNameArray = MemberNameArray;
})(TypeScript2 || (TypeScript2 = {}));
var a = new TypeScript2.MemberNameArray();
