define("outputdir_module_multifolder/ref/m1", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.m1_a1 = 10;
    var m1_c1 = (function () {
        function m1_c1() {
        }
        return m1_c1;
    }());
    exports.m1_c1 = m1_c1;
    exports.m1_instance1 = new m1_c1();
    function m1_f1() {
        return exports.m1_instance1;
    }
    exports.m1_f1 = m1_f1;
});
define("outputdir_module_multifolder_ref/m2", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.m2_a1 = 10;
    var m2_c1 = (function () {
        function m2_c1() {
        }
        return m2_c1;
    }());
    exports.m2_c1 = m2_c1;
    exports.m2_instance1 = new m2_c1();
    function m2_f1() {
        return exports.m2_instance1;
    }
    exports.m2_f1 = m2_f1;
});
define("outputdir_module_multifolder/test", ["require", "exports", "outputdir_module_multifolder/ref/m1", "outputdir_module_multifolder_ref/m2"], function (require, exports, m1, m2) {
    "use strict";
    exports.__esModule = true;
    exports.a1 = 10;
    var c1 = (function () {
        function c1() {
        }
        return c1;
    }());
    exports.c1 = c1;
    exports.instance1 = new c1();
    function f1() {
        return exports.instance1;
    }
    exports.f1 = f1;
    exports.a2 = m1.m1_c1;
    exports.a3 = m2.m2_c1;
});
//# sourceMappingURL=../../../mapFiles/test.js.map