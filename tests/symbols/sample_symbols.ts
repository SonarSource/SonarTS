var variable;
const constant;
let local;
local = 42;

let decAndInit = 42;

const read = "read";

variable = read + 2; // Not working yet

const arr = [read];
const obj = {
  read,
  prop: read,
};
foo(read);

function foo(parameter: any, pWithDefault: any = {}) {}
