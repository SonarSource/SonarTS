export function toCreateModule() {}

import {} from "somewhere";

  switch (a) {
//^^^^^^ {{Replace this "switch" statement with "if" statements to increase readability.}}
  case 1:
    doSomething();
    break;
  default:
    doSomething();
}

  switch (a) {
//^^^^^^ {{Replace this "switch" statement with "if" statements to increase readability.}}
}

switch (a) {         // OK
  case 1:
  case 2:
    break;
  default:
    doSomething();
    break;
}

switch (a) {         // OK
  case 1:
    break;
  default:
    doSomething();
    break;
  case 2:
}

switch (a) {         // OK
  case 1:
    break;
  case 2:
}

  switch (a) {
//^^^^^^ {{Replace this "switch" statement with "if" statements to increase readability.}}
  case 1:
    break;
}
