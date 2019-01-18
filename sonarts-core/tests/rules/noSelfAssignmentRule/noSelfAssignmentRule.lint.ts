export function toCreateModule() {}

let x, y, a, i;

x = 1;

x = y;

x + x;

x || x;

  x = x;
//^^^^^            {{Remove or correct this useless self-assignment.}}

x = this.x;

  this.x = this.x;
//^^^^^^^^^^^^^^^   {{Remove or correct this useless self-assignment.}}

  a.b.x = a.b.x;
//^^^^^^^^^^^^^   {{Remove or correct this useless self-assignment.}}
  x[i] = x[i];
//^^^^^^^^^^^  {{Remove or correct this useless self-assignment.}}

x += x;

x = x + x;

while (x = x) {}
//     ^^^^^       {{Remove or correct this useless self-assignment.}}

let arr = [];

  arr = arr.reverse();
//^^^^^^^^^^^^^^^^^^^  {{Remove or correct this useless self-assignment.}}

  arr = arr.sort();
//^^^^^^^^^^^^^^^^  {{Remove or correct this useless self-assignment.}}

let notArray: any;
notArray = notArray.reverse();
notArray = notArray.sort();

let n:number[] = [];
   n = [...n];
// ^^^^^^^^^^   {{Remove or correct this useless self-assignment.}}

class Foo2 {
  n: number[];
  public do() {
      this.n = [...this.n];
//    ^^^^^^^^^^^^^^^^^^^^    {{Remove or correct this useless self-assignment.}}
     
  }
}

class A {
  private x = "";
  private arr = [];
  private _y = "";

  update() {
    this.arr[0] = this.arr[0];
//  ^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove or correct this useless self-assignment.}}
    this.x = this.x;
//  ^^^^^^^^^^^^^^^    {{Remove or correct this useless self-assignment.}}
    
    this.y = this.y;
  }

  set y(value:string){
    this._y = value;
  }

  get y(): string {
    return this._y;
  }
}
