import * as foo from "./foo"

function x(x: number) {
  if (<number>4 > <number>4) { // S1764
    console.log("");
  }
}