// tslint:disable

let a, b;

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
  case 1:
//     ^                {{This case duplicates the one on line 23}}  
  default:
}

switch (a) {
  case 1:
  case 1:
//     ^                {{This case duplicates the one on line 30}}  
  case 2:
  default:
}

switch (a) {
  case 1:
  case 2:
  case 1:
//     ^                {{This case duplicates the one on line 38}}  
  default:
}
