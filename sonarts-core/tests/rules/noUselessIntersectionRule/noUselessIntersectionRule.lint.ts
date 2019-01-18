export function toCreateModule() {}

function withNull(x: number & null) {}
//                            ^^^^ {{Remove this type without members or change this type intersection.}}

function withUndefined(x: { a: string } & undefined) {}
//                                        ^^^^^^^^^ {{Remove this type without members or change this type intersection.}}

function withVoid(x: string & void) {}
//                            ^^^^ {{Remove this type without members or change this type intersection.}}

function triple(x: null & string & undefined) {}
//                 ^^^^ {{Remove this type without members or change this type intersection.}}
//        [12:35-12:44] {{Remove this type without members or change this type intersection.}}

function declarations() {
  let x: string & null;
  //              ^^^^ {{Remove this type without members or change this type intersection.}}
}

function withEmptyObjectLiteral(x: { a: string } & {}) {}
//                                                 ^^ {{Remove this type without members or change this type intersection.}}

interface Empty {}
function withEmptyInterface(x: { a: string } & Empty) {}
//                                             ^^^^^ {{Remove this type without members or change this type intersection.}}

function withAny(x: any & { a: string }) {}
//                  ^^^^^^^^^^^^^^^^^^^ {{Simplify this intersection as it always has type "any".}}

function withNever(x: boolean & never) {}
//                    ^^^^^^^^^^^^^^^ {{Simplify this intersection as it always has type "never".}}

// OK
function twoPrimitives(x: string & number) {}

// OK
function twoInterfaces(x: { a: string } & { b: number }) {}

// OK, extended interface
interface WithString {
  a: string;
}
interface NotEmpty extends WithString {}
function withNotEmptyInterface(x: { a: string } & NotEmpty) {}

export default 1;
