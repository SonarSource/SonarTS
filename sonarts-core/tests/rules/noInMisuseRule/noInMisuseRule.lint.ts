export function toCreateModule() {}

let arr = ["a", "b", "c"];

  "1" in arr;
//^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
  1 in arr;
//^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
  "b" in arr;
//^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}


// in different contexts
const result = "car" in arr ? "something" : "someething else";
//             ^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
foo("car" in arr);
//  ^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
if ("car" in arr) {}
//  ^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}


// to check the property of an object do this
"car" in { "car" : 1};
// and not this
  "car" in Object.keys({ "car": 1 });
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}

function erroneousIncludesES2016(array: any[], elem: any) {
  return elem in array;
  //     ^^^^^^^^^^^^^ {{Use "indexOf" or "includes" (available from ES2016) instead.}}
}


const dict = {a: 1, b: 2, c: 3};
"a" in dict;  // OK on objects

function okOnArrayLikeObjects(a: any, b: any) {
  let key = "1";
  if (key in arguments) {
    return "Something";
  }
  return "Something else";
}