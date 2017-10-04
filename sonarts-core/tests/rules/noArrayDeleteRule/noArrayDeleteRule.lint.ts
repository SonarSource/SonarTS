// tslint:disable

let arr = ['a', 'b', 'c', 'd'];
let i = 1;
let a;

  delete arr[1];
//^^^^^^ {{Remove this use of "delete".}}

  delete arr[i];
//^^^^^^ {{Remove this use of "delete".}}

if (true) {
  delete arr[1]
//^^^^^^ {{Remove this use of "delete".}}
}

function foo(arr) {
  delete arr[1] // OK, arr's type is not known, could be object, deleting property of object is allowed
}

arr.splice(2, 1); // OK

delete a.arr[1] // OK, a.arr could be object

var obj = { 1: "b" };

delete obj[1];  // OK, obj is object
