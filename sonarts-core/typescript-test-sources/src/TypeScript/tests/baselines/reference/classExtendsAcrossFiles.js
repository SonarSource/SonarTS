//// [tests/cases/compiler/classExtendsAcrossFiles.ts] ////

//// [a.ts]
import { b } from './b';
export const a = {
    f: () => {
        class A { }
        class B extends A { }
        b.f();
    }
};
//// [b.ts]
import { a } from './a';
export const b = {
    f: () => {
        class A { }
        class B extends A { }
        a.f();
    }
};

//// [b.js]
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
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.b = {
    f: function () {
        var A = (function () {
            function A() {
            }
            return A;
        }());
        var B = (function (_super) {
            __extends(B, _super);
            function B() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return B;
        }(A));
        a_1.a.f();
    }
};
//// [a.js]
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
Object.defineProperty(exports, "__esModule", { value: true });
var b_1 = require("./b");
exports.a = {
    f: function () {
        var A = (function () {
            function A() {
            }
            return A;
        }());
        var B = (function (_super) {
            __extends(B, _super);
            function B() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return B;
        }(A));
        b_1.b.f();
    }
};
