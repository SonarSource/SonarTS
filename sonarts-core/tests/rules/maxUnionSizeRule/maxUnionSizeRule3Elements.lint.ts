function nokFn(a: number | boolean | string | undefined) {
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}
}

function okFn(a: number | boolean) {
}


