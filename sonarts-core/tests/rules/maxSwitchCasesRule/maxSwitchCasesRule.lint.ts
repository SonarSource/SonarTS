switch(i) {
  case 1:
    f();
  case 2:
    g();
}

switch(i) {
  case 1:
    f();
  case 2:
    g();
  default:
    console.log("foo");
}

switch(i) {
  case 1:
  case 2:
    g();
  case 3:
    console.log("foo");
}

switch(i) {}
