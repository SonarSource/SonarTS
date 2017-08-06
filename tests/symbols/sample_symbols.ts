// DECLARATIONS

var variable;
const constant;
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

let { dstruct1, dstruct2 = 42 } = someObj;

let [ arrDStruct1, _, , arrDStruct2 = 4] = someArr;

export let exported = 42; // I have not yet found a way to intercept this

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
