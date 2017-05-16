// tslint:disable

/**
 * NOK
 */

  a == b && a == b
//^^^^^^^^^^^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "&&"}}

  a == b || a == b 
//^^^^^^^^^^^^^^^^  {{Correct one of the identical sub-expressions on both sides of operator "||"}}

  a > a;
//^^^^^ {{Correct one of the identical sub-expressions on both sides of operator ">"}}

  a >= a;
//^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator ">="}}

  a < a;
//^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "<"}}

  a <= a;
//^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "<="}}

  5 / 5;
//^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "/"}}

  5 - 5;
//^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "-"}}

  a << a;
//^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "<<"}}

  obj.foo() < obj.foo();
//^^^^^^^^^^^^^^^^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator "<"}}

  foo(() => doSomething()) > foo(() => doSomething());
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator ">"}}

  null >= null;
//^^^^^^^^^^^^ {{Correct one of the identical sub-expressions on both sides of operator ">="}}

/**
 * OK
 */
1 << 1;

if (1 << 1) {}

a !== a;

a === a;

a == a;

a != a;

a == b;

a != b;

a === b;

a !== b;

a == b && a == c

a == b || a == c

5 != x;

5 / x;

5 - x;

x != y();

function f() {
  if (+a !== +a);
}

foo(), foo();

if (Foo instanceof Foo) {
}

<Identifier>node).text === "eval" || (<Identifier>node).text === "arguments"
nodeText === '"use strict"' || nodeText === "'use strict'"
name === "any" || name === "string"
name === "any" || name === "string" || name === "number" || name === "boolean" || name === "never"
name.charCodeAt(0) === CharacterCodes._ && name.charCodeAt(1) === CharacterCodes._
!needCollisionCheckForIdentifier(node, name, "require") && !needCollisionCheckForIdentifier(node, name, "exports")
json["typeAcquisition"] || json["typingOptions"]
count !== 8 && count !== 13
text.charCodeAt(pos + 1) === CharacterCodes.dot && text.charCodeAt(pos + 2) === CharacterCodes.dot

dirPath.match(/localhost:\d+$/) || dirPath.match(/localhost:\d+\/$/)

this.props.router.isActive(`/${this.props.params.projectName}/models/${model.name}/schema`) || this.props.router.isActive(`/${this.props.params.projectName}/models/${model.name}/databrowser`)
window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`]
`${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window
