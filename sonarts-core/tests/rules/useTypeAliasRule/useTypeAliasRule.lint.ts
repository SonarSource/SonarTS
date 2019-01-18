function foo(x: string | null | number) {
  //            ^^^^^^^^^^^^^^^^^^^^^^ {{Replace this union type with a type alias. It is also used on lines 5,8.}}
}

const bar: string | null | number = null;
//         ^^^^^^^^^^^^^^^^^^^^^^ <

function zoo(): string | null | number {
//              ^^^^^^^^^^^^^^^^^^^^^^ <
  return null;
}

type MyType = string | null | number;

function fun(x: A & B & C, y: A & B & C, z: A & B & C) {
  //            ^^^^^^^^^ {{Replace this intersection type with a type alias.}}
}

let x: number | string;
let y: number | string;
let z: number | string; // this fine because only 2 types in the union
const another: MyType | undefined = ""; // actual union contains 4 types, but AST node only 2

let a: any[] | null; // this is not a union when strict is false

interface A {
  name: string;
  a: number;
}

interface B {
  name: string;
  b: number;
}

interface C {
  name: string;
  b: number;
}

// ok, ignore usage inside type alias
type Alias = number | number[] | undefined;
function one(x: number | number[] | undefined) {}
function two(x: number | number[] | undefined) {}

export function toCreateModule() {}
