//// [classExpressionWithStaticPropertiesES62.ts]
var v = class C {
    static a = 1;
    static b
    static c = {
        x: "hi"
    }
    static d = C.c.x + " world";
 };

//// [classExpressionWithStaticPropertiesES62.js]
var v = (_a = class C {
    },
    _a.a = 1,
    _a.c = {
        x: "hi"
    },
    _a.d = _a.c.x + " world",
    _a);
var _a;
