function nok() {
    let x = [1, 2];
//      ^ {{Either use this collection's contents or remove the collection.}}


    x = [];
    x[1] = 42;
    x[2] += 42;
    x.push(1);
    x.pop();
    x.reverse();
}

function nok2() {
    let arrayConstructor = new Array();
//      ^^^^^^^^^^^^^^^^ {{Either use this collection's contents or remove the collection.}}

    arrayConstructor[1] = 42;
}

function nok3() {
    let arrayWithoutNew = Array();
//      ^^^^^^^^^^^^^^^ {{Either use this collection's contents or remove the collection.}}

    arrayWithoutNew[1] = 42;
}

function nok4() {
    let x: number[];
//      ^ {{Either use this collection's contents or remove the collection.}}
    x = new Array();
    x[1] = 42;
}

function nok5() {
    let myMap = new Map();
//      ^^^^^ {{Either use this collection's contents or remove the collection.}}
    myMap.set(1, "foo1");
    myMap.clear();
}

function nok6() {
    let mySet = new Set();
//      ^^^^^ {{Either use this collection's contents or remove the collection.}}
    mySet.add("foo1");
    mySet.delete("foo1");
    mySet = new Set();
}

function nok7() {
    let mySet = new WeakSet();
//      ^^^^^ {{Either use this collection's contents or remove the collection.}}
    mySet.add({});
    mySet.delete({});
}


// OK

function okUnused() {
    let x = [1, 2];
}

function parameterUpdated(p: number[]) {
    p.push(1);
}

function propertyUpdated() {
    let a = {x: []};
    a.x.push(1);
    
    return a;
}

function ok1() {
    let x = [];
    return x;
}

function ok2() {
    let x = [1, 2];
    console.log(x[0]);
}

function ok3() {
    let x = [1, 2], y: number;
    y = x[1];
}

function ok4() {
    let x = [1, 2];
    x.forEach(element => console.log(element));
}

export class Foo {
    myArray: string [] = [];
    fn() {
      this.myArray.push(""); // OK for properties
    }
  }
  