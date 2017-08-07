function linear() {
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
    x = x + 1;  // 'x = x + 1' is dead because of 'x = -1'
    x = -1;
  }
}

function loopsAndBranches(p: boolean) {
  let x = 0;
  let y = 0; // 'y = 0' is dead because of 'y = p'
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
    y = x + 1; // 'y = x + 1' is dead because of 'y = x'
  }
  if (p === x) {
    x++; // 'x++' is never used afterwards
  }
}
