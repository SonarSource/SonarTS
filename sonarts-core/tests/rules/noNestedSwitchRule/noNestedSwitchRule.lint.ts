export function foo(){}

let x = 42, y = 42, z = 42, a = 1, b = 2, c = 3, d = 4, e = 5;

switch (x) { 
  case 1: a; break;
  default: b; 
};

switch (x) {
    case 1: a; break;
    case 2: 
      switch (y) {
//    ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
        case 3: c; break;
        default: d;
      };
      break;
    default: b;
}

switch (x) {
  case 1: a; break;
  case 2: {
    switch (y) {
//  ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
      case 3: c; break;
      default: d;
    };
    switch (z) {
//  ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
      case 3: c; break;
      default: d;
    };
    break;
  }
  default: b;
}

switch (x) {
  case 1: a; break;
  case 2: 
    switch (y) {
//  ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
      case 3: c;
      default: 
        switch (z) {
//      ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
          case 4: d; break;
          default: e;
      }
    }
    break;
  default: b;
}

switch (x) {
    case 1: a;
    case 2: b;
    default: 
      switch (y) {
//    ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
        case 3: c;
        default: d;
      }
}

switch (x) {
  case 1:
    let isideFunction = () => {
      switch (y) {}
//    ^^^^^^ {{Refactor the code to eliminate this nested "switch".}}
    }
}