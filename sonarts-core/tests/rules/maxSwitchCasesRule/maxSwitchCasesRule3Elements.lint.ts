export function toCreateModule() {}

  switch (i) {
//^^^^^^{{Reduce the number of non-empty switch cases from 4 to at most 3.}}
  case 1:
    f();
  case 2:
    g();
  case 3:
    h();
  case 4:
    w();
}

// empty branches are not counted
switch (i) {
  case 1:
  case 2:
    g();
  case 3:
    h();
  case 4:
    w();
}

// default branch is excluded
switch (i) {
  case 1:
    f();
  case 2:
    g();
  case 3:
    h();
  default:
    console.log("foo");
}