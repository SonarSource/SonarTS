//// [ClassAndModuleThatMergeWithStaticVariableAndExportedVarThatShareAName.ts]
class Point {
    constructor(public x: number, public y: number) { }

    static Origin: Point = { x: 0, y: 0 };
}

module Point {
    export var Origin = ""; //expected duplicate identifier error
}


module A {
    export class Point {
        constructor(public x: number, public y: number) { }

        static Origin: Point = { x: 0, y: 0 };
    }

    export module Point {
        export var Origin = ""; //expected duplicate identifier error
    }
}

//// [ClassAndModuleThatMergeWithStaticVariableAndExportedVarThatShareAName.js]
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
Point.Origin = { x: 0, y: 0 };
(function (Point) {
    Point.Origin = ""; //expected duplicate identifier error
})(Point || (Point = {}));
var A;
(function (A) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    Point.Origin = { x: 0, y: 0 };
    A.Point = Point;
    (function (Point) {
        Point.Origin = ""; //expected duplicate identifier error
    })(Point = A.Point || (A.Point = {}));
})(A || (A = {}));
