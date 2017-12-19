// tslint:disable
// DECLARATIONS
var variable;
const constant = 42;
let local;

function foo(parameter: any, pWithDefault: any = {}) {}

class Foo {

}

enum Enum {

}

// WRITES

local = 42;

let decAndInit = 42;

const read = "read";

// READS

variable = read + 2;

const arr = [read];
const obj = {
  read,
  prop: read,
};

foo(read);

let { dstruct1, dstruct2 = 42 } = {dstruct1: 1};

let [ arrDStruct1, _, , arrDStruct2 = 4] = [1, 2, 3, 4];

export let exported = 42;

import { imported1, imported2 } from "some_lib";
import * as importedNS from "some_other_lib";
import importEquals = require("yet_another_lib");

declare module Module {

}

declare module "StringLiteralModule" {

}

let varEl1, varEl2 = 42;

interface Interface {

}

let rw = 0;
++rw;
--rw;
++(rw);
(rw)--;
rw++;
rw--;

let objWithProp = {prop: 3};
console.log(objWithProp.prop);
objWithProp.prop = 42;

let a, b, d, e, rest;
({a, b = 1, c:d = 42, f:e, ...rest} 
                           = {a: 1, b: 2, c: 3, f:4});
[a, b = 1, , d, ...rest] = [1, 2, 3, 4];

foo({a, b});

function objectLiteralShorthand() {
  const x = 41;
  return {x};
}

class A {

  private propertyDeclaration;

  constructor(private propertyDeclarationInConstructor: number) {}

  method1() {
    return this.propertyDeclaration;
  }
}
