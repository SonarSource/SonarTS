const comp = "b";
interface Foo {
  a: number | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
// [3:14-3:23] <
  [comp]: number | undefined;
//^^^^^^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
  c: number | string;
  d: undefined | Foo | Bar | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
  e;
  f: boolean;
  g: undefined;
  h: Foo<undefined> | Bar
  i: number | string | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
  j?: number | undefined;
//             ^^^^^^^^^ {{Consider removing redundant 'undefined' type}}
}

class Bar {
  a: number | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
}

const obj : {
  a: number | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
}

interface Foo {
  compliant?: number
}

const obj2: {
  compliant?: number
}

// OK
function foo(param: number | undefined) {}
