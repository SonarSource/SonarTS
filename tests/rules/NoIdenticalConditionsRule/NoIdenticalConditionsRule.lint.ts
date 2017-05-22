// tslint:disable

let a, b, foo, bar;

if (a) {
} else if (a) {
//         ^            {{This branch duplicates the one on line 5}}
}

if (b) {
} else if (a) {
} else if (a) {
//         ^            {{This branch duplicates the one on line 11}}  
}

if (a) {
} else if (b) {
} else if (a) {
//         ^            {{This branch duplicates the one on line 16}}  
}

switch (a) {
  case 1:
    foo();
    break;
  case 1:
//     ^                {{This case duplicates the one on line 23}}  
    bar();
    break;
  default:
}

switch (a) {
  case 1:
    foo();
    break;
  case 1:
//     ^                {{This case duplicates the one on line 34}}  
    bar();
    break;
  case 2:
  default:
}

switch (a) {
  case 1:
    foo();
    break;
  case 2:
  case 1:
//     ^                {{This case duplicates the one on line 46}}  
    bar();
    break;
  default:
}

// ok, fall-through
switch (a) {
  case 1:
  case 2:
    foo();
  case 1:
    bar();
    break;
  default:
}

// ok, fall-through
switch (a) {
  case 1:
  case 2:
    if (3) { foo(); } else { bar(); }
  case 1:
    bar();
    break;
  default:
}