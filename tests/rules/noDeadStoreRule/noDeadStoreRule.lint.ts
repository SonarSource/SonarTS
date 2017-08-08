// tslint:disable

function simple() {
  let x = 34;
//    ^ {{Remove this useless assignment to local variable "x".}}
  x = 22;
  doSomething(x);
}

const y = { z : 3};
y.z = 55;
// add try-block case

// exclude unused decomposition variables