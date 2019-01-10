let array : number[] = [];
  array[2];
//^^^^^ {{Remove this call; the collection can only be empty here.}}

for (let item of array) {
  //             ^^^^^{{Remove this call; the collection can only be empty here.}}
}

  array.forEach(item => console.log());
//^^^^^{{Remove this call; the collection can only be empty here.}}

let nonEmptyArray = [1, 2, 3];
nonEmptyArray[2]; // OK
nonEmptyArray.forEach(item => console.log()); // OK
for (let item of nonEmptyArray) {} // OK

let arrayLatelyInitialized: number[] = [];
arrayLatelyInitialized.push(1);
arrayLatelyInitialized.forEach(item => console.log()); // OK

let arrayConstructor = new Array();
  arrayConstructor.forEach(item => console.log());
//^^^^^^^^^^^^^^^^{{Remove this call; the collection can only be empty here.}}

let arrayWithoutNew = Array();
  arrayWithoutNew.forEach(item => console.log());
//^^^^^^^^^^^^^^^{{Remove this call; the collection can only be empty here.}}

let myMap = new Map();
  myMap.get(1);
//^^^^^{{Remove this call; the collection can only be empty here.}}


let mySet = new Map();
  mySet.has(1);
//^^^^^{{Remove this call; the collection can only be empty here.}}

export let exportedArray: number[] = [];
exportedArray[1]; // OK

import { IMPORTED_ARRAY } from "../noUnusedArrayRule/dep";
IMPORTED_ARRAY[1]; // OK

function f(parameterArray: number[]) {
  parameterArray[1]; // OK
}

class Foo {
  myArray: string [] = [];
  fn() {
    this.myArray[1]; // OK
  }
}


let arrayPassedtoAFunction = [];
fillArray(arrayPassedtoAFunction);
arrayPassedtoAFunction[1]; // OK

let arrayPassedtoAConstructorCall = [];
new fillArray(arrayPassedtoAConstructorCall);
arrayPassedtoAConstructorCall[1]; // OK

let overwrittenArray = [];
let otherArray = [1,2,3,4];
overwrittenArray = otherArray;
overwrittenArray [1]; // OK

var arrayWrittenInsideArrow = [];
func(n => arrayWrittenInsideArrow.push(n));
arrayWrittenInsideArrow[1];  // OK

var arrayWrittenInsideArrow2 = [];
func(n => arrayWrittenInsideArrow2 = otherArray);
arrayWrittenInsideArrow2[1]; // OK


// Interface Declaration

interface Array<T> {
  equals(array: Array<T>): boolean // OK
}


// Module Declaration

export type MyArray = ProblemPattern[];

export namespace MyArray {
  export function is(value: any): value is MyArray {
    return value && Types.isArray(value);
  }
}