export function toCreateModule() {}

function nokFn(a: A | B | C | D | E | F) {}
//                ^^^^^^^^^^^^^^^^^^^^^ {{Refactor this union type to have less than 5 elements.}}

interface nokInterfaceDeclaration {
    prop: A | B | C | D | E | F;
//        ^^^^^^^^^^^^^^^^^^^^^ {{Refactor this union type to have less than 5 elements.}}
}

type T = A | B | C | D | E | F; // OK

function okFn(a: T) {}

interface okInterfaceDeclaration {
    prop: T;
}


