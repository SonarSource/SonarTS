export function toCreateModule() {}

function nokFn(a: A | B | C | D) {}
//                ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}

let nokVarA: A | B | C | D
//           ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}

// in more complex types
let nokFunctionType: (param: any) => A | B | C | D
//                                   ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}

let nokTupleType : [string, A | B | C | D];
//                          ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}

interface nokInterfaceDeclaration {
  prop: A | B | C | D;
//      ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}
}

// Not applied when using type alias statement
type T = A | B | C | D;

// Raise an issue if not at top level
type U = (A | B | C | D) & E;
//        ^^^^^^^^^^^^^ {{Refactor this union type to have less than 3 elements.}}
function okFn(a: T) {}

let okVarA : T;

let okFunctionType: (param: any) => T

let okTupleType: [string, T];

interface okInterfaceDeclaration {
    prop: T;
}

// OK: less than 3
function smallUnionType(a: number | boolean) {}
