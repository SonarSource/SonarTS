//// [typeGuardsInClassAccessors.ts]
// Note that type guards affect types of variables and parameters only and 
// have no effect on members of objects such as properties. 

// variables in global
var num: number;
var strOrNum: string | number;
var var1: string | number;
class ClassWithAccessors {
    // Inside public accessor getter
    get p1() {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string

        return strOrNum;
    }
    // Inside public accessor setter
    set p1(param: string | number) {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // parameter of function declaration
        num = typeof param === "string" && param.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string
    }
    // Inside private accessor getter
    private get pp1() {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string

        return strOrNum;
    }
    // Inside private accessor setter
    private set pp1(param: string | number) {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // parameter of function declaration
        num = typeof param === "string" && param.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string
    }
    // Inside static accessor getter
    static get s1() {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string

        return strOrNum;
    }
    // Inside static accessor setter
    static set s1(param: string | number) {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // parameter of function declaration
        num = typeof param === "string" && param.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string
    }
    // Inside private static accessor getter
    private static get ss1() {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string

        return strOrNum;
    }
    // Inside private static accessor setter
    private static set ss1(param: string | number) {
        // global vars in function declaration
        num = typeof var1 === "string" && var1.length; // string

        // parameter of function declaration
        num = typeof param === "string" && param.length; // string

        // variables in function declaration
        var var2: string | number;
        num = typeof var2 === "string" && var2.length; // string
    }
}


//// [typeGuardsInClassAccessors.js]
// Note that type guards affect types of variables and parameters only and 
// have no effect on members of objects such as properties. 
// variables in global
var num;
var strOrNum;
var var1;
var ClassWithAccessors = (function () {
    function ClassWithAccessors() {
    }
    Object.defineProperty(ClassWithAccessors.prototype, "p1", {
        // Inside public accessor getter
        get: function () {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
            return strOrNum;
        },
        // Inside public accessor setter
        set: function (param) {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // parameter of function declaration
            num = typeof param === "string" && param.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassWithAccessors.prototype, "pp1", {
        // Inside private accessor getter
        get: function () {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
            return strOrNum;
        },
        // Inside private accessor setter
        set: function (param) {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // parameter of function declaration
            num = typeof param === "string" && param.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassWithAccessors, "s1", {
        // Inside static accessor getter
        get: function () {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
            return strOrNum;
        },
        // Inside static accessor setter
        set: function (param) {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // parameter of function declaration
            num = typeof param === "string" && param.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClassWithAccessors, "ss1", {
        // Inside private static accessor getter
        get: function () {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
            return strOrNum;
        },
        // Inside private static accessor setter
        set: function (param) {
            // global vars in function declaration
            num = typeof var1 === "string" && var1.length; // string
            // parameter of function declaration
            num = typeof param === "string" && param.length; // string
            // variables in function declaration
            var var2;
            num = typeof var2 === "string" && var2.length; // string
        },
        enumerable: true,
        configurable: true
    });
    return ClassWithAccessors;
}());
