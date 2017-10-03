//// [declFileTypeAnnotationTypeAlias.ts]
module M {
    export type Value = string | number | boolean;
    export var x: Value;

    export class c {
    }

    export type C = c;

    export module m {
        export class c {
        }
    }

    export type MC = m.c;

    export type fc = () => c;
}

interface Window {
    someMethod();
}

module M {
    export type W = Window | string;
    export module N {
        export class Window { }
        export var p: W;
    }
}

//// [declFileTypeAnnotationTypeAlias.js]
var M;
(function (M) {
    var c = (function () {
        function c() {
        }
        return c;
    }());
    M.c = c;
    var m;
    (function (m) {
        var c = (function () {
            function c() {
            }
            return c;
        }());
        m.c = c;
    })(m = M.m || (M.m = {}));
})(M || (M = {}));
(function (M) {
    var N;
    (function (N) {
        var Window = (function () {
            function Window() {
            }
            return Window;
        }());
        N.Window = Window;
    })(N = M.N || (M.N = {}));
})(M || (M = {}));


//// [declFileTypeAnnotationTypeAlias.d.ts]
declare module M {
    type Value = string | number | boolean;
    var x: Value;
    class c {
    }
    type C = c;
    module m {
        class c {
        }
    }
    type MC = m.c;
    type fc = () => c;
}
interface Window {
    someMethod(): any;
}
declare module M {
    type W = Window | string;
    module N {
        class Window {
        }
        var p: W;
    }
}
