// tslint:disable

let x, y, a, i;

x = 1;

x = y;

x + x;

x || x;

  x = x;
//^^^^^            {{Remove or correct this useless self-assignment.}}

x = this.x;

this.x = this.x; // OK

a.b.x = a.b.x; // OK

x[i] = x[i]; // OK

x += x;

x = x + x;

while (x = x) {}
//     ^^^^^       {{Remove or correct this useless self-assignment.}}

let arr = [];

  arr = arr.reverse();
//^^^^^^^^^^^^^^^^^^^  {{Remove or correct this useless self-assignment.}}

let notArray: any;
notArray = notArray.reverse();
