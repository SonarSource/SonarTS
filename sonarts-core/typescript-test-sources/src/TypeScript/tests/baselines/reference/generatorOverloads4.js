//// [generatorOverloads4.ts]
class C {
    f(s: string): Iterable<any>;
    f(s: number): Iterable<any>;
    *f(s: any): Iterable<any> { }
}

//// [generatorOverloads4.js]
class C {
    *f(s) { }
}
