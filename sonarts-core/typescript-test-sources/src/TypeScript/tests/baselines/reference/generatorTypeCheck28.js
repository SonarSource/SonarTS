//// [generatorTypeCheck28.ts]
function* g(): IterableIterator<(x: string) => number> {
    yield * {
        *[Symbol.iterator]() {
            yield x => x.length;
        }
    };
}

//// [generatorTypeCheck28.js]
function* g() {
    yield* {
        *[Symbol.iterator]() {
            yield x => x.length;
        }
    };
}
