//// [decoratorOnVar.ts]
declare function dec<T>(target: T): T;

@dec
var x: number;

//// [decoratorOnVar.js]
var x;
