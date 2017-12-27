function bar() {}
function baz() {}

function foo(x: any) {
  switch (x) {
    case 1:
      return 1;
    case 2 || 3:
      // ^^^^^^ {{Explicitly specify 2 separate cases that fall through; currently this case clause only works for "2".}}
      return 2;
    case "a" || "b" || "c" || "d":
      // ^^^^^^^^^^^^^^^^^^^^^^^^ {{Explicitly specify 4 separate cases that fall through; currently this case clause only works for "a".}}
      return 3;
    case bar() || baz(): // OK, not literals
      return 4;
    default:
      return 5;
  }
}

export default 1;
