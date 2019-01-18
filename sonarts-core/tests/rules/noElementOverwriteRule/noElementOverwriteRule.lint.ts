export function toCreateModule() {}
function test(cond: boolean): void {
  let fruits = [];
  fruits[1] = "banana";
  fruits[1] = "apple";
//^^^^^^ {{Verify this is the index that was intended; "1" was already set on line 4.}}

  fruits = [];
  fruits[1] = "banana";
  fruits[1] = "apple";
//^^^^^^ {{Verify this is the index that was intended; "1" was already set on line 9.}}

  if (cond) {
    fruits[1] = "potato"; // Compliant, because it's another block
  }

  fruits[2] = "orange";
  fruits[2] = fruits[2] + ";"; // Compliant

  for (let i = 0; i < 10; i++) {
    fruits[i] = "melon";
    fruits[i] = "pear";
  //^^^^^^ {{Verify this is the index that was intended; "i" was already set on line 21.}}
    fruits[i++] = "another";
  }

  let numbers: number[] = new Array<number>();
  numbers[1] = 42;
  numbers = new Array<number>();
  numbers[1] = 42; // Compliant
}

function map(): void {
  const myMap = new Map<string, number>();
  myMap.set("key", 1);
  myMap.set("key", 2);
//^^^^^ {{Verify this is the index that was intended; "key" was already set on line 35.}}
  myMap.clear();
  myMap.set("key", 1);
}

function set() {
  const mySet = new Set();
  mySet.add(1);
  mySet.add(2);
  mySet.add(3);
  mySet.add(2);
//^^^^^ {{Verify this is the index that was intended; "2" was already set on line 45.}}
  mySet.clear();
  mySet.add(2); // Compliant
}


function properties(person: any, x: any) {
  person.first = "John";
  person.first = "Smith";
//^^^^^^ {{Verify this is the index that was intended; "first" was already set on line 55.}}
  person.last = "Smith";
  person.last = person.last + " ";
  person.last = person.last + "-"; // Compliant, used on RHS
  person.last += ";";
  person = {};
  person.last = "Andersen";

  x.bla = x.y;
  x.foo = x.y;

  x.y.width = 1;
  x.z.width = 2;
}


class Test {
  arr: number[];

  private propertyAccess(i: number) {
    this.arr[i] = 2;
    this.arr[i] = 3;
//  ^^^^^^^^ {{Verify this is the index that was intended; "i" was already set on line 77.}}
    this.arr[i] = Math.max(this.arr[i], 0);
  }
}

declare var global: string[];

global[1] = "foo";
  global[1] = "bar";
//^^^^^^ {{Verify this is the index that was intended; "1" was already set on line 86.}}

function anotherCollection() {
  let x = [1,], y = [1, ];
  x[1] = 3;
  y[1] = x[1];
  x[1] = 43; // Compliant
}

function switchTest(kind: number) {
  let result = [];
  switch (kind) {
    case 1:
      result[1] = 1;
      result[1] = 2;
    //^^^^^^ {{Verify this is the index that was intended; "1" was already set on line 101.}}
      break;
    case 2:
      result[2] = 1;
      result[2] = 2;
    //^^^^^^ {{Verify this is the index that was intended; "2" was already set on line 106.}}
      break;
  }
}

function indexChanges() {
  let nums = [];
  let i = 1;
  nums[i++] = 42;
  nums[i++] = 43;
  i += 1;
  nums[i] = 2;
  i += 1;
  nums[i] = 2;
}

interface MyObj {
  arr: number[];
  map: Map<string, number>;
}

function issue431(arg: number) {
  let obj1: MyObj = {
    arr: [],
    map: new Map<string, number>()
  };
  let obj2: MyObj = {
    arr: [],
    map: new Map<string, number>()
  };
  obj1.arr[arg] = 1;
  obj2.arr[arg] = 2;

  obj1.map.set("hello", 1);
  obj2.map.set("hello", 1);
}

function secondary() {
  let fruits = [];
  fruits[1] = "banana";
//^^^^^^ > {{Previous write to "1".}}
  fruits[1] = "apple";
//^^^^^^ {{Verify this is the index that was intended; "1" was already set on line 147.}}
}
