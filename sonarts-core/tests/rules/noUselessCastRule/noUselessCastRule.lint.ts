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
