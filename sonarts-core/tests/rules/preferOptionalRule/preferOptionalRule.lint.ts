const comp = "b";
interface Foo {
  a: number | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
// [3:14-3:23] <
  [comp]: number | undefined;
//^^^^^^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
  c: number | string;
  d: undefined | undefined;
  e;
  f: boolean;
}

class Bar {
  a: number | undefined;
//^ {{Consider using '?' syntax to declare this property instead of 'undefined' in its type.}}
}
