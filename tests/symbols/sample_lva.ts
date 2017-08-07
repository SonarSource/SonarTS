function linear() {
  let x = 0;
  let y = 0;
  y = 1;
  let z = x + y;
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
    // Since we never read 'y' here, 'y = 0' is dead
    read(x);
  }
}