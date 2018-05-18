// good

interface i1 {
  a();
  a(x: number);
  b();
  b(x: string);
}

interface i2 {
  a();
  a(x: number);
  a(): void;
  b();
  b(x: string);
}

interface i3 {
  a();
  "a"();
}

interface i4 {
  a();
  ["a"]();
}

interface i5 {
  a(): string;
  bar: {
    a(): number;
  }
}

interface i6 {
  // ensure no false positives for properties/methods available from prototype chain
  toString(): string;
}

interface i7 {
  // Computed properties with different source code text OK
  [Symbol.iterator](): void;
  [Symbol.toStringTag](): void;
}

interface i8 {
  // Computed property with same source code text as regular property OK
  [Symbol.iterator](): void;
  x: number;
  "Symbol.iterator"(): void;
}


// bad

interface b1 {
  a();
//^^^^  {{All 'a' signatures should be adjacent}}
  a(x: number);

  b();
  b(x: string);
  a(x: string);
//^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

interface b2 {
  a();
//^^^^  {{All 'a' signatures should be adjacent}}
  a(x: number);
  b();
  b(x: string);
  a(): void;
//^^^^^^^^^^ < {{Non-adjacent overload}}
}

interface b3 {
  a();
//^^^^  {{All 'a' signatures should be adjacent}}
  f();
  "a"();
//^^^^^^ < {{Non-adjacent overload}}
  12();
//^^^^^  {{All '12' signatures should be adjacent}}
  g();
  12();
//^^^^^ < {{Non-adjacent overload}}
}

interface b4 {
  a();
//^^^^   {{All 'a' signatures should be adjacent}}
  b(): void;
  ["a"](v: number): void;
//^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

interface b5 {
  a(): string;
  bar: {
    a(): number;
//  ^^^^^^^^^^^^   {{All 'a' signatures should be adjacent}}
    b();
    a(b: number): void;
//  ^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
  }
}

interface b6 {
  (): void;
//^^^^^^^^^  {{All '()' signatures should be adjacent}}
  x: number;
  (x: number): number;
//^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

// Also works in classes, source files, modules, namespaces

class C {
  a(): void;
//^^^^^^^^^^  {{All 'a' signatures should be adjacent}}
  b(): void;
  a(x: number): void;
//^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

  declare function a(): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^  {{All 'a' signatures should be adjacent}}
declare function b(): void;
  declare function a(x: number): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}

declare module "m" {
  export function a(): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^  {{All 'a' signatures should be adjacent}}
  export function b(): void;
  export function a(x: number): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

declare namespace N {
  export function a(): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^  {{All 'a' signatures should be adjacent}}
  export function b(): void;
  export function a(x: number): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

class Foo {
  public static bar() {}
  private constructor() {}
//^^^^^^^^^^^^^^^^^^^^^^^^ {{All 'constructor' signatures should be adjacent}}
  public bar() {}
  public constructor(foo: any) {}
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

// A semicolon on its own is a SemicolonClassElement, but still consider them adjacent.
class Bar {
  get test() { return 0; };
  set test(v: number) {};
}

interface I {
  // Catches computed properties with same source code text
  [Symbol.iterator](): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^ {{All 'Symbol.iterator' signatures should be adjacent}}
  x: number;
  [Symbol.iterator](): void;
//^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Non-adjacent overload}}
}

class Accessors {
  private x: number;
  private y: number;
  get x() {return this.x;}
  get y() {return this.y;}
  set x(newX: number) {this.x = newX;}

  set y(newY: number) {this.y = newY;}

}

