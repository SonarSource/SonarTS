let array : number[] = [];
  array[2];
//^^^^^ {{Review this usage of array as it can only be empty here.}}

for (let item of array) {
  //             ^^^^^{{Review this usage of array as it can only be empty here.}}
}

for (let item in array) {
  //             ^^^^^{{Review this usage of array as it can only be empty here.}}
}

  array.forEach(item => console.log());
//^^^^^{{Review this usage of array as it can only be empty here.}}

let nonEmptyArray = [1, 2, 3];
nonEmptyArray[2]; // OK
nonEmptyArray.forEach(item => console.log()); // OK
for (let item of nonEmptyArray) {} // OK

let arrayLatelyInitialized: number[] = [];
arrayLatelyInitialized.push(1);
arrayLatelyInitialized.forEach(item => console.log()); // OK

let arrayConstructor = new Array();
  arrayConstructor.forEach(item => console.log());
//^^^^^^^^^^^^^^^^{{Review this usage of arrayConstructor as it can only be empty here.}}

let arrayWithoutNew = Array();
  arrayWithoutNew.forEach(item => console.log());
//^^^^^^^^^^^^^^^{{Review this usage of arrayWithoutNew as it can only be empty here.}}

let myMap = new Map();
  myMap.get(1);
//^^^^^{{Review this usage of myMap as it can only be empty here.}}


let mySet = new Map();
  mySet.has(1);
//^^^^^{{Review this usage of mySet as it can only be empty here.}}

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
  equals(array: Array<T>): boolean // OK, symbol Array is an interface declaration
}


// Type Alias Declaration

type MyArrayTypeAlias = T[];

function isMyArrayTypeAlias(value: any): value is MyArrayTypeAlias { // OK, symbol MyArrayTypeAlias is a TypeAliasDeclaration
  return value && Types.isArray(value);
}

function allowedReadUsages(otherArray: number[]) {
  let emptyArray: number[] = [];
  let v = otherArray || emptyArray; // OK used in OR expression
  const obj = {
    a: emptyArray // OK, emptyArray is used in a property declaration
  }
  return emptyArray; // OK, emptyArray is used in a return statement
}

let initialArray = [];

  initialArray.concat(otherArray);
//^^^^^^^^^^^^{{Review this usage of initialArray as it can only be empty here.}}


const potentiallyNonEmptyArray1 : number [] = [];
const potentiallyNonEmptyArray2: number[] = [];
(true ? potentiallyNonEmptyArray1 : potentiallyNonEmptyArray2).push(1);

potentiallyNonEmptyArray1[0]; // OK
potentiallyNonEmptyArray2[0]; // OK

const reassignedArray: number[] = [];
const aliasArray = reassignedArray;
aliasArray.push(1);

aliasArray[0]; // OK
reassignedArray[0]; // OK

const iterableArray = [];
  iterableArray[Symbol.iterator];
//^^^^^^^^^^^^^{{Review this usage of iterableArray as it can only be empty here.}}

const externalInitializedArray: number[] = init();
externalInitializedArray[0]; // OK

const notInitializedArray: number[];
  notInitializedArray[0];
//^^^^^^^^^^^^^^^^^^^{{Review this usage of notInitializedArray as it can only be empty here.}}