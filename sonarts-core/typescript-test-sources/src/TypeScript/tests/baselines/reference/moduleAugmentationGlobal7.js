//// [moduleAugmentationGlobal7.ts]
namespace A {
    declare global {
        interface Array<T> { x }
    }
}

//// [moduleAugmentationGlobal7.js]
