//// [duplicateConstructSignature2.ts]
interface I<T> {
    (x: T): number;
    (x: T): string;
}

//// [duplicateConstructSignature2.js]
