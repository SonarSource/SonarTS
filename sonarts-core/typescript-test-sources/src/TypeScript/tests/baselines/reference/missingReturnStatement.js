//// [missingReturnStatement.ts]
module Test {
    export class Bug {
        public foo():string {
        }
    }    
}


//// [missingReturnStatement.js]
var Test;
(function (Test) {
    var Bug = (function () {
        function Bug() {
        }
        Bug.prototype.foo = function () {
        };
        return Bug;
    }());
    Test.Bug = Bug;
})(Test || (Test = {}));
