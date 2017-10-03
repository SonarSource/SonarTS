//// [tests/cases/compiler/declFileAccessors.ts] ////

//// [declFileAccessors_0.ts]
/** This is comment for c1*/
export class c1 {
    /** getter property*/
    public get p3() {
        return 10;
    }
    /** setter property*/
    public set p3(/** this is value*/value: number) {
    }
    /** private getter property*/
    private get pp3() {
        return 10;
    }
    /** private setter property*/
    private set pp3(/** this is value*/value: number) {
    }
    /** static getter property*/
    static get s3() {
        return 10;
    }
    /** setter property*/
    static set s3( /** this is value*/value: number) {
    }
    public get nc_p3() {
        return 10;
    }
    public set nc_p3(value: number) {
    }
    private get nc_pp3() {
        return 10;
    }
    private set nc_pp3(value: number) {
    }
    static get nc_s3() {
        return "";
    }
    static set nc_s3(value: string) {
    }

    // Only getter property
    public get onlyGetter() {
        return 10;
    }

    // Only setter property
    public set onlySetter(value: number) {
    }
}

//// [declFileAccessors_1.ts]
/** This is comment for c2 - the global class*/
class c2 {
    /** getter property*/
    public get p3() {
        return 10;
    }
    /** setter property*/
    public set p3(/** this is value*/value: number) {
    }
    /** private getter property*/
    private get pp3() {
        return 10;
    }
    /** private setter property*/
    private set pp3(/** this is value*/value: number) {
    }
    /** static getter property*/
    static get s3() {
        return 10;
    }
    /** setter property*/
    static set s3( /** this is value*/value: number) {
    }
    public get nc_p3() {
        return 10;
    }
    public set nc_p3(value: number) {
    }
    private get nc_pp3() {
        return 10;
    }
    private set nc_pp3(value: number) {
    }
    static get nc_s3() {
        return "";
    }
    static set nc_s3(value: string) {
    }

    // Only getter property
    public get onlyGetter() {
        return 10;
    }

    // Only setter property
    public set onlySetter(value: number) {
    }
}

//// [declFileAccessors_0.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** This is comment for c1*/
var c1 = (function () {
    function c1() {
    }
    Object.defineProperty(c1.prototype, "p3", {
        /** getter property*/
        get: function () {
            return 10;
        },
        /** setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1.prototype, "pp3", {
        /** private getter property*/
        get: function () {
            return 10;
        },
        /** private setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1, "s3", {
        /** static getter property*/
        get: function () {
            return 10;
        },
        /** setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1.prototype, "nc_p3", {
        get: function () {
            return 10;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1.prototype, "nc_pp3", {
        get: function () {
            return 10;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1, "nc_s3", {
        get: function () {
            return "";
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1.prototype, "onlyGetter", {
        // Only getter property
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c1.prototype, "onlySetter", {
        // Only setter property
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    return c1;
}());
exports.c1 = c1;
//// [declFileAccessors_1.js]
/** This is comment for c2 - the global class*/
var c2 = (function () {
    function c2() {
    }
    Object.defineProperty(c2.prototype, "p3", {
        /** getter property*/
        get: function () {
            return 10;
        },
        /** setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2.prototype, "pp3", {
        /** private getter property*/
        get: function () {
            return 10;
        },
        /** private setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2, "s3", {
        /** static getter property*/
        get: function () {
            return 10;
        },
        /** setter property*/
        set: function (/** this is value*/ value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2.prototype, "nc_p3", {
        get: function () {
            return 10;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2.prototype, "nc_pp3", {
        get: function () {
            return 10;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2, "nc_s3", {
        get: function () {
            return "";
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2.prototype, "onlyGetter", {
        // Only getter property
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(c2.prototype, "onlySetter", {
        // Only setter property
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    return c2;
}());


//// [declFileAccessors_0.d.ts]
/** This is comment for c1*/
export declare class c1 {
    /** getter property*/
    /** setter property*/
    p3: number;
    /** private getter property*/
    /** private setter property*/
    private pp3;
    /** static getter property*/
    /** setter property*/
    static s3: number;
    nc_p3: number;
    private nc_pp3;
    static nc_s3: string;
    readonly onlyGetter: number;
    onlySetter: number;
}
//// [declFileAccessors_1.d.ts]
/** This is comment for c2 - the global class*/
declare class c2 {
    /** getter property*/
    /** setter property*/
    p3: number;
    /** private getter property*/
    /** private setter property*/
    private pp3;
    /** static getter property*/
    /** setter property*/
    static s3: number;
    nc_p3: number;
    private nc_pp3;
    static nc_s3: string;
    readonly onlyGetter: number;
    onlySetter: number;
}
