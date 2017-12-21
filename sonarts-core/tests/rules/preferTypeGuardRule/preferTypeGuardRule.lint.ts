  function isFish(animal: Animal) {
//^^^^^^^^ {{Change this boolean return type into the type predicate "animal is Fish".}}
  return (animal as Fish).swim !== undefined;
}

function isFish(animal: Animal): animal is Fish {
  return (animal as Fish).swim !== undefined;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Change this boolean return type into the type predicate "animal is Fish".}}
  return (animal as Fish).swim != undefined;
}

// `any` type is excluded
function isFish(animal: Animal) {
  return (animal as any).swim != undefined;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Change this boolean return type into the type predicate "animal is Fish".}}
  return !!((animal as Fish).swim);
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

function isFish(animal: Animal) {
  return !!animal.name;
}

  function isFish(animal: Animal) {
//^^^^^^^^ {{Change this boolean return type into the type predicate "animal is Fish".}}
  return (<Fish>animal).swim !== undefined;
}

// OK, to avoid FP at line 48
let typePredicate = (animal: Animal) => !!(animal as Fish).swim;

parsedPatterns.filter(parsedPattern => !!(<ParsedStringPattern>parsedPattern).basenames);

class Farm {
  isFish(animal: Animal) {
//^^^^^^ {{Change this boolean return type into the type predicate "animal is Fish".}}
    return !!((animal as Fish).swim);
  }

  isFishOK(animal: Animal): animal is Fish {
    return !!((animal as Fish).swim);
  }
}


interface Animal {
  name: string;
}

interface Fish extends Animal {
  swim: Function;
}
