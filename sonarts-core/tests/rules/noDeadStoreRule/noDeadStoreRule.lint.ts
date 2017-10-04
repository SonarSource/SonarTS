// tslint:disable

function simple() {
  let x = 0;  // OK, we except 0
  x = 42;
//^ {{Remove this useless assignment to local variable "x".}}
  x = 4
  doSomething(x);
}

function branching(p: boolean) {
  let x = 0;
  if (p) {
    x = 42;
    doSomething(x);
  } else {
    doSomething(x);
  }
}

function objecsAndArrays() {
  const obj = { z : 3 };
  obj.z = 55; // OK, we ignore object properties
  obj.z = 42;
  let { z } = obj;
//      ^ {{Remove this useless assignment to local variable "z".}}
  z = 3;
//^ {{Remove this useless assignment to local variable "z".}}

  let arr = [];
  arr.push(obj);
  arr = [obj];
//^^^ {{Remove this useless assignment to local variable "arr".}}
}

class AClass {
  constructor(private x: number = 0, y: number) {
    this.x = 1; // OK, we ignore fields
    y = 3;
//  ^ {{Remove this useless assignment to local variable "y".}}
  }

  aMethod(x: number) {
    x = 3;
//  ^ {{Remove this useless assignment to local variable "x".}}    
  }
}

function loops(end: number) {
  let x;
  for (; end; x++) {
//            ^ {{Remove this useless assignment to local variable "x".}}
    x = 2;
//  ^ {{Remove this useless assignment to local variable "x".}}
    x = 4;
  }

  x = -2;
  while (x) {
    x = x + 2;
  }

  x = -2;
//^ {{Remove this useless assignment to local variable "x".}}
  do {
    x = end + 2;
  } while (x);
}

function exceptions() {
  let x = 0;
  let x2 = -1;
  let x3 = 1;
  let s = "";
  let arr = [];
  let arr2 = [,,];
//    ^^^^ {{Remove this useless assignment to local variable "arr2".}}
  let obj = {};
  let obj2 = { x };
//    ^^^^ {{Remove this useless assignment to local variable "obj2".}}
  let n = null;
  let b = true;
  let b2 = false;
  
  let d, e = 2, f = 1;
//       ^ {{Remove this useless assignment to local variable "e".}}

  x = 1;
//^ {{Remove this useless assignment to local variable "x".}}
}

class MyClass {

  public globalVariables() {
    console = new Console();
  }

}
