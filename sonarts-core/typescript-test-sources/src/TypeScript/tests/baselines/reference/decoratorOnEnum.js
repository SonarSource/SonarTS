//// [decoratorOnEnum.ts]
declare function dec<T>(target: T): T;

@dec
enum E {
}

//// [decoratorOnEnum.js]
var E;
(function (E) {
})(E || (E = {}));
