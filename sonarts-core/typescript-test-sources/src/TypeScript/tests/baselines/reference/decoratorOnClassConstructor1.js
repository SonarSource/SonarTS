//// [decoratorOnClassConstructor1.ts]
declare function dec<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;

class C {
    @dec constructor() {}
}

//// [decoratorOnClassConstructor1.js]
var C = (function () {
    function C() {
    }
    return C;
}());
