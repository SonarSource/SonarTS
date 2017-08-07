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

function oneLoop() {
  let x = 0;
  let y = 0;
  while (x < 5) {
    x++;
    y = x; // 'y = 0' is dead because the only read happens after increment
    read(y);
  }
}
