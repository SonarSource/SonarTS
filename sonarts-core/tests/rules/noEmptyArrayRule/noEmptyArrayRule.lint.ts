const array : number[] = [];

export function testElementAccessRead() {
  console.log(array[2]);
  //          ^^^^^ {{Review this usage of 'array' as it can only be empty here.}}
}

function testLoopRead() {
  for (const _ of array) {
    //            ^^^^^{{Review this usage of 'array' as it can only be empty here.}}
  }
  
  for (const _ in array) {
    //            ^^^^^{{Review this usage of 'array' as it can only be empty here.}}
  }
}

function testIterationMethodsRead() {
  array.forEach(item => console.log());
//^^^^^{{Review this usage of 'array' as it can only be empty here.}}
  array[Symbol.iterator]();
//^^^^^{{Review this usage of 'array' as it can only be empty here.}}
}

function testAccessorMethodsRead(otherArray: number[]) {
  const initialArray: number[] = [];
  return initialArray.concat(otherArray);
       //^^^^^^^^^^^^{{Review this usage of 'initialArray' as it can only be empty here.}}
}

function okForNotEmptyInit() {
  const nonEmptyArray = [1, 2, 3];
  foo(nonEmptyArray[2]); // OK
  nonEmptyArray.forEach(item => console.log()); // OK
  for (const _ of nonEmptyArray) { console.log(); } // OK
}

function okLatelyWritten() {
  const okLatelyWritten: number[] = [];
  okLatelyWritten.push(1);
  okLatelyWritten.forEach(item => console.log()); // OK
}


function okLatelyInitialized() {
  let arrayLatelyInitialized: number[];
  arrayLatelyInitialized = [];
  arrayLatelyInitialized.forEach(item => console.log()); // OK, FN
}

function testCollectionContructors(){
  const arrayConstructor = new Array();
  arrayConstructor.forEach(item => console.log());
//^^^^^^^^^^^^^^^^ {{Review this usage of 'arrayConstructor' as it can only be empty here.}}

  const notEmptyarrayConstructor = new Array(1, 2, 3);
  notEmptyarrayConstructor.forEach(item => console.log()); // Ok

  const arrayWithoutNew = Array();
  arrayWithoutNew.forEach(item => console.log());
//^^^^^^^^^^^^^^^{{Review this usage of 'arrayWithoutNew' as it can only be empty here.}}

  const myMap = new Map();
  myMap.get(1);
//^^^^^{{Review this usage of 'myMap' as it can only be empty here.}}


  const mySet = new Set();
  mySet.has(1);
//^^^^^{{Review this usage of 'mySet' as it can only be empty here.}}
}

export let exportedArray: number[] = [];
foo(exportedArray[1]); // OK

import { IMPORTED_ARRAY } from "./dep";
foo(IMPORTED_ARRAY[1]); // OK

function parametersAreIgnore(parameterArray: number[]) {
  foo(parameterArray[1]);
  parameterArray = [];
  foo(parameterArray[1]); // OK, FN
}

class MyClass {
  myArray: string [] = [];
  propertiesAreIgnored() {
    foo(this.myArray[1]); // OK
  }
}

function arrayUsedAsArgument() {
  const array: number[] = [];
  foo(array);
  const copy = new Array(...array);
  copy.push(42);
  foo(array[1]); // OK

  return copy;
}

function reassignment() {
  let overwrittenArray = [];
  const otherArray = [1,2,3,4];
  overwrittenArray = otherArray;
  foo(overwrittenArray[1]); // OK

  const arrayWrittenInsideArrow: number[] = [];
  foo((n: number) => arrayWrittenInsideArrow.push(n));
  foo(arrayWrittenInsideArrow[1]);  // OK

  let arrayWrittenInsideArrow2: number[] = [];
  foo((n: number) => arrayWrittenInsideArrow2 = otherArray);
  foo(arrayWrittenInsideArrow2[1]); // OK
}

// Interface Declaration
interface Array<T> {
  equals(array: Array<T>): boolean // OK, symbol Array is an interface declaration
}

// Type Alias Declaration
type MyArrayTypeAlias = T[];
// OK, symbol MyArrayTypeAlias is a TypeAliasDeclaration
function isMyArrayTypeAlias(value: MyArrayTypeAlias | number): value is MyArrayTypeAlias { 
  return !!(value as any).length;
}

function arrayUsedInORExpression(otherArray: number[]) {
  const emptyArray: number[] = [];
  console.log(otherArray || emptyArray); // OK used in OR expression
}

function arrayUsedInPropertyDeclaration() {
  const emptyArray: number[] = [];
  return {
    a: emptyArray // OK, emptyArray is used in a property declaration
  };
}

function arrayUsedInReturnStatement() {
  const emptyArray: number[] = [];
  return emptyArray; // OK, emptyArray is used in a return statement
}


function writeWithTernaryOperator(flag: boolean) {
  const potentiallyNonEmptyArray1 : number [] = [];
  const potentiallyNonEmptyArray2: number[] = [];
  (flag ? potentiallyNonEmptyArray1 : potentiallyNonEmptyArray2).push(1);
  
  foo(potentiallyNonEmptyArray1[0]); // OK
  foo(potentiallyNonEmptyArray2[0]); // OK
}

function writeOnAliasVariable() {
  const reassignedArray: number[] = [];
  const aliasArray = reassignedArray;
  aliasArray.push(1);
  
  foo(aliasArray[0]); // OK
  foo(reassignedArray[0]); // OK
}

function arrayInitializedByFunctionCall(init: () => number[]) {
  const externalInitializedArray: number[] = init();
  foo(externalInitializedArray[0]); // OK
}

function arrayNotInitialized() {
  let notInitializedArray!: number[];
  foo(notInitializedArray[0]);
    //^^^^^^^^^^^^^^^^^^^{{Review this usage of 'notInitializedArray' as it can only be empty here.}}
}

function compoundAssignmentEmptyArray() {
  const compoundAssignmentEmptyArray: number[] = [];
  compoundAssignmentEmptyArray[1] += 42;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^{{Review this usage of 'compoundAssignmentEmptyArray' as it can only be empty here.}}
}

function assignmentEmptyArray() {
  const assignmentEmptyArray: number[] = [];
  assignmentEmptyArray[1] = 42; // ok
}

function destructuringAssignmentEmptyArray() {
  const destructuringAssignmentEmptyArray: number[] = [];
  [ , destructuringAssignmentEmptyArray[1]] = [42, 42]; // ok
  foo(destructuringAssignmentEmptyArray[1]);
}

function elementAccessWithoutAssignment() {
  const elementAccessWithoutAssignment: number[] = [];
  foo(elementAccessWithoutAssignment[1]);
  //  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^{{Review this usage of 'elementAccessWithoutAssignment' as it can only be empty here.}}
}