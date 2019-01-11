  function isFish(animal: Animal) {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return (animal as Fish).swim !== undefined;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return Boolean((animal as Fish).swim);
}

function isFish(animal: Animal): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

// With explicit return type
  function isFish(animal: Animal) : boolean {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return (animal as Fish).swim !== undefined;
}

// With loose inequality
  function isFish(animal: Animal) {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return (animal as Fish).swim != undefined;
}

// `any` type is excluded
function isFish(animal: Animal) {
  return (animal as any).swim != undefined;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return !!((animal as Fish).swim);
}

function isNotFish(animal: Animal) {
  return !((animal as Fish).swim);
}

// OK, not a property access
function isFish(animal: Animal) {
  return !!(animal as Fish);
}

// OK, more than one statement
function isFish(animal: Animal) {
  console.log("FOO");
  return !!((animal as Fish).swim);
}

// OK, more than one argument
function isFish(animal: Animal, foo: String) {
  return !!((animal as Fish).swim);
}

// OK, no type casting
function isFish(animal: Animal) {
  return !!animal.name;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
  return (<Fish>animal).swim !== undefined;
}

// Arrow functions are ignored

let typePredicate = (animal: Animal) => !!(animal as Fish).swim;
let typePredicateOK = (animal: Animal): animal is Fish => !!(animal as Fish).swim;

let animals : Animal[] = [];
let fishes = animals.filter((animal: Animal) => !!(animal as Fish).swim);
let fishes = animals.filter((animal: Animal) => !!(<Fish>animal).swim);
let fishesOK = animals.filter((animal: Animal): animal is Fish => !!(animal as Fish).swim);


// Function Expressions are ignored
let isFish = function (animal: Animal) {
  return (animal as Fish).swim !== undefined;
}

let isFishOK = function (animal: Animal) : animal is Fish {
  return (animal as Fish).swim !== undefined;
}

// Method declarations

class Farm {
  isFish(animal: Animal) {
//^^^^^^ {{Declare this function return type using type predicate "animal is Fish".}}
    return !!((animal as Fish).swim);
  }

  isFishOK(animal: Animal): animal is Fish {
    return !!((animal as Fish).swim);
  }
}

// Type predicate on "this"
class Animal {
  swim?: Function;
  
  isFish(): boolean {
//^^^^^^ {{Declare this function return type using type predicate "this is Fish".}}
    return !!(this as Fish).swim;
  }

  isFishOK() : this is Fish {
    return !!(this as Fish).swim;
  }
}

declare function isFishNoBody(): boolean

interface Animal {
  name: string;
}

interface Fish extends Animal {
  swim: Function;
}

// Disjoint union types
type A1 = {
  common: 1,
  a1: string
};

type A2 = {
  common: 2,
  a2: number
};

// FN
function isA1(param: A1 | A2) {
  return param.common === 1;
}

// FN
function isSomeA1(param: A1 | A2) {
  return param.common === 1 && param.a1 === "Hello";
}