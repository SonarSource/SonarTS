// tslint:disable

let a = [];

const b = a.reverse();
//        ^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}

// ok, there is `slice`
a.slice().reverse().forEach(() => {});

// ok
a.reverse();

// ok
a.map(() => true).reverse();

a = a.reverse();
//  ^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}

function something(a: string[]) {}
something(a.reverse());
//        ^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}

// ok
const c = [1, 2, 3].reverse();

// ok
function foo() {
  const keys = [];

  // fill keys...

  const x = keys.reverse();
  //        ^^^^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}

  return keys.reverse();
}

class Bar {
  field: string[];

  public method() {
    const b = this.field.reverse();
    //        ^^^^^^^^^^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}

    // ok
    this.field.reverse();

    // ok
    const c = this.getFieldCopy().reverse();
  }

  public getFieldCopy() {
    return [...this.field];
  }
}

function change(s: string): string {
  // ok
  return s.split("").reverse().join();
}

class NotArray {
  public reverse() {}
}

const notArray = new NotArray();
// ok
const notArrayReversed = notArray.reverse();

function qux(a: string[][]) {
  return a.map(b => b.reverse());
  //                ^^^^^^^^^^^  {{Move this array "reverse" operation to a separate statement.}}
}