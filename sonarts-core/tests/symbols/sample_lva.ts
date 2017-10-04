function linear(p: boolean) {
  let x = 0;
  let y = 0;
  y = 1;
  const z = x + y;
}

function oneBranch(p: boolean) {
  let x = 0;
  let y = 0;
  if (p) {
    x = 1;
    y = 1;
    read(x);
    read(y);
  } else {
    // Since we don't read 'y' here, 'y = 0' is dead
    read(x);
  }
}

function oneLoop(end: boolean) {
  let x = 0;
  while (end) {
    x = x + 1;  // dead because of 'x = -1'
    x = -1;
  }
}

function loopsAndBranches(p: boolean) {
  let x = 0;
  let y = 0; // dead because of 'y = p'
  if (p) {
    y = p;
    for (; x < 5; x++) {
      read(y);
      y = x;
    }
    x = 3;
  }
  while (read(x)) {
    y = x;
    read(y);
    y = x + 1; // dead because of 'y = x'
  }
  if (p === x) {
    x++; // dead
  }
}

class SomeClass {
  private x = 0;

  public someMethod() {
    this.x = 3; // Ignored, it's a property
    let y = 0; // dead
    y = 1;
  }

  public containerMethod() {
    let x = 0; // Ignored, used in nestedFunction
    x = 1; // Ignored, used in nestedFunction
    let y = 1; // dead
    let z = -1; // Ignored, used in lambda

    function nestedFunction(callback: () => void) {
      x = 3;
    }

    nestedFunction(() => read(z));

  }
}

function destructuring() {
  let x = 0;
  let y = 0;
  [x, y] = [x, y];
  read(x, y);

  let a, b, c, d;
  ({a, b, prop1: c, prop2: d = 1} = obj); // 'c' and 'd' are written but not read
  read(a, b);
}
