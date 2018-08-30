function typeAssertion(p1: number, p2: number | string, p3?: number) {
  p1 as number;
//^^^^^^^^^^^^ {{Remove this unnecessary cast.}}

  if (typeof p2 == "string") {
    p2 as string;
//  ^^^^^^^^^^^^ {{Remove this unnecessary cast.}}
  }

  if (p3) {
    <number> p3;
//  ^^^^^^^^^^^ {{Remove this unnecessary cast.}}    
    p3 as number;
//  ^^^^^^^^^^^^ {{Remove this unnecessary cast.}}
  }
 
  // OK
  p2 as number;
}

function singletonType(x: number) {
  // OK
  let a = <"aValue">"aValue";
  let b = <"aValue" | "bValue">"aValue";
}

function enums() {
  const Elevation = {
    // OK
    ZERO: 0 as 0,
    ONE: 1 as 1,
    TWO: 2 as 2,
    THREE: 3 as 3,
    FOUR: 4 as 4,
  };
  type Stuff = typeof Elevation[keyof typeof Elevation];
}


function nonNullAssertion(p1: number, p2: number | null, p4: number | string, p3?: number) {
  p1!;
//^^^ {{Remove this unnecessary not-null assertion.}}

  p4!;
//^^^ {{Remove this unnecessary not-null assertion.}}


  if (p2 && p3) {
    p2!;
//  ^^^ {{Remove this unnecessary not-null assertion.}}
    p3!;
//  ^^^ {{Remove this unnecessary not-null assertion.}}
  }

  // OK
  p2!; p3!;

}

function exception() {
  return [4, "foo"];
}

export const arr: [number, string][] = [];
arr.push(exception() as [number, string]);

// OK 
null!;

class UserName {
  name: string;
}

class SuperClass {}

class SubClass extends SuperClass {}
class SubSubClass extends SubClass {}

interface SuperInterface {}
interface SubInterface extends SuperInterface {}

class ImplementationClass implements SuperInterface {}

function parentType(p1: SubClass, p2: SubInterface, p3: ImplementationClass, p4: SubSubClass, p5: SuperClass) {
  p1 as SuperClass;
//^^^^^^^^^^^^^^^^ {{Remove this unnecessary cast.}}
  p2 as SuperInterface;
//^^^^^^^^^^^^^^^^^^^^ {{Remove this unnecessary cast.}}
  p4 as SuperClass;
//^^^^^^^^^^^^^^^^ {{Remove this unnecessary cast.}}

  p3 as SuperInterface; // OK, FN
  p5 as SubClass; // OK
}