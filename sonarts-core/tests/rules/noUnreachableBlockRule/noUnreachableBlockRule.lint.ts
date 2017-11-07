function alwaysTrueIf(x: number[], y: {}) {
  if (x) return 1;
  //  ^ FN: This condition always evaluates to "true".
  if (!!y) return 1;
  //  ^^^ FN: This condition always evaluates to "true".
}

function alwaysFalseIf(x: {}, y: undefined, z: null, w: void, u: undefined | null) {
  if (!x) return 1;
  //  ^^ FN: This condition always evaluates to "false".
  if (y) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (z) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (w) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (u) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if ("") return 1;
  //  ^^ FN: This condition always evaluates to "false".
  if (0) return 1;
  //  ^ FN: This condition always evaluates to "false".
  if (NaN) return 1;
  //  ^^^ FN: This condition always evaluates to "false".
}

function alwaysFalseIfByConstraint(x: string) {
  if (x === "") {
    if (x) {
      //^ FN: This condition always evaluates to "false".
    }
  }
}

function alwaysTrueTernary(x: number[]) {
  if (x) return 1;
  //  ^ FN: This condition always evaluates to "true".
}

function l(x: number[]) {
  return x ? 1 : 2;
  //     ^ FN: This condition always evaluates to "true".
}

function b(x: number) {
  if (x) return 1;
}

function d(x: string) {
  if (x) return 1;
}

function e(x: boolean) {
  if (x) return 1;
}

function j(x: number[] | null) {
  if (x) return 1;
}

function k(x: number[] & null) {
  if (x) return 1;
}

function m(x: number) {
  return x ? 1 : 2;
}

function n(x: any) {
  return x ? 1 : 2;
}

function optionals(x?: {}) {
  if (x) return 1;
}

class Foo {
  x: Foo;

  public ownProperty() {
    if (this.x) return 1;
  }

  public interfaceProperty(foo: { bar: SomeInterface }) {
    if (foo.bar.x) return 1;
    //  ^^^^^^^^^ FN: This condition always evaluates to "true".
  }

  public classProperty(foo: { bar: SomeClass }) {
    if (foo.bar.x) return 1;
  }
}

interface SomeInterface {
  x: {};
}

class SomeClass {
  x: {};
}

function indexTypes(x: { [key: string]: {} }) {
  if (x["foo"]) return 1;
}

function changeInCallback(arr: number[]) {
  let flag = false;
  arr.forEach(x => {
    if (x > 3) flag = true;
  });

  if (!flag) return 1;
}

function dom() {
  return performance && performance.now ? performance.now() : null;
}

function nullable(x: {}) {
  if (x) return 1;
}
nullable(null);

export default 1;

function equality() {
  let x = foo();
  const y = x;
  if (x === y) return 1;
  //  ^^^^^^^ {{This condition always evaluates to "true".}}
}
