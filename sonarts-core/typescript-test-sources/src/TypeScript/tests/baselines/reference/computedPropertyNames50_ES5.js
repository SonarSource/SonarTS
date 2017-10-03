//// [computedPropertyNames50_ES5.ts]
var x = {
    p1: 10,
    get foo() {
        if (1 == 1) {
            return 10;
        }
    },
    get [1 + 1]() {
        throw 10;
    },
    set [1 + 1]() {
        // just throw
        throw 10;
    },
    get [1 + 1]() {
        return 10;
    },
    get foo() {
        if (2 == 2) {
            return 20;
        }
    },
    p2: 20
}

//// [computedPropertyNames50_ES5.js]
var x = (_a = {
        p1: 10,
        get foo() {
            if (1 == 1) {
                return 10;
            }
        }
    },
    Object.defineProperty(_a, 1 + 1, {
        get: function () {
            throw 10;
        },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 1 + 1, {
        set: function () {
            // just throw
            throw 10;
        },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 1 + 1, {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    }),
    _a.p2 = 20,
    _a);
var _a;
