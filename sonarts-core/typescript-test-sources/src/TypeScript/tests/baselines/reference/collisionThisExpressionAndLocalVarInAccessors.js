//// [collisionThisExpressionAndLocalVarInAccessors.ts]
class class1 {
    get a(): number {
        var x2 = {
            doStuff: (callback) => () => {
                var _this = 2;
                return callback(this);
            }
        }

        return 10;
    }
    set a(val: number) {
        var x2 = {
            doStuff: (callback) => () => {
                var _this = 2;
                return callback(this);
            }
        }

    }
}

class class2 {
    get a(): number {
        var _this = 2;
        var x2 = {
            doStuff: (callback) => () => {
                return callback(this);
            }
        }

        return 10;
    }
    set a(val: number) {
        var _this = 2;
        var x2 = {
            doStuff: (callback) => () => {
                return callback(this);
            }
        }

    }
}

//// [collisionThisExpressionAndLocalVarInAccessors.js]
var class1 = (function () {
    function class1() {
    }
    Object.defineProperty(class1.prototype, "a", {
        get: function () {
            var _this = this;
            var x2 = {
                doStuff: function (callback) { return function () {
                    var _this = 2;
                    return callback(_this);
                }; }
            };
            return 10;
        },
        set: function (val) {
            var _this = this;
            var x2 = {
                doStuff: function (callback) { return function () {
                    var _this = 2;
                    return callback(_this);
                }; }
            };
        },
        enumerable: true,
        configurable: true
    });
    return class1;
}());
var class2 = (function () {
    function class2() {
    }
    Object.defineProperty(class2.prototype, "a", {
        get: function () {
            var _this = this;
            var _this = 2;
            var x2 = {
                doStuff: function (callback) { return function () {
                    return callback(_this);
                }; }
            };
            return 10;
        },
        set: function (val) {
            var _this = this;
            var _this = 2;
            var x2 = {
                doStuff: function (callback) { return function () {
                    return callback(_this);
                }; }
            };
        },
        enumerable: true,
        configurable: true
    });
    return class2;
}());
