export function toCreateModule() {}

function bar() {}
function baz() {}

function foo(x: any, y: any, z: any) {
  switch (x) {
    case 1:
      return 1;
    case 2 || 3:
      // ^^^^^^ {{Explicitly specify 2 separate cases that fall through; currently this case clause only works for "2".}}
      return 2;
    case "a" || "b" || "c" || "d":
      // ^^^^^^^^^^^^^^^^^^^^^^^^ {{Explicitly specify 4 separate cases that fall through; currently this case clause only works for "a".}}
      return 3;
    case y || z || 1:
      // ^^^^^^^^^^^ {{Explicitly specify 3 separate cases that fall through; currently this case clause only works for "y".}}
      return 3;
    case bar() || baz():
      // ^^^^^^^^^^^^^^ {{Explicitly specify 2 separate cases that fall through; currently this case clause only works for "bar()".}}
      return 4;
    case 5 && 6: // OK, not ||
      return 6;
    default:
      return 5;
  }
}

export default 1;
