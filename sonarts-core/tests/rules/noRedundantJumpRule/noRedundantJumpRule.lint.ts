function redundantJump(x: number) {
  if (x == 1) {
    console.log("x == 1");
    return;
//  ^^^^^^^ {{Remove this redundant jump.}}
  }
}

function redundantJump1(condition1: boolean, condition2: boolean) {
  while (condition1) {
    if (condition2) {
      continue;
//    ^^^^^^^^^ {{Remove this redundant jump.}}
    } else {
      console.log("else");
    }
  }
}

function redundantJump2(b: boolean) {
  for (let i = 0; i < 10; i++) {
    continue;
//  ^^^^^^^^^ {{Remove this redundant jump.}}
  }
  if (b) {
    console.log("b");
    return;
//  ^^^^^^^ {{Remove this redundant jump.}}
  }
}

function compliant1(b: boolean) {
  for (let i = 0; i < 10; i++) {
    break;
  }
  if (b) {
    console.log("b");
    return;
  }
  console.log("useful");
}


function return_in_non_void_method(): number {
  foo();
  return 42;
}


function switch_statements(x: number) {
  switch (x) {
    case 0:
      foo();
      break;
    default:
  }
  foo();
  switch (x) {
    case 0:
      foo();
      return;
    case 1:
      bar();
      return;
  }
}

function loops_with_label() {
  for (let i = 0; i < 10; i++) {
    inner: for (let j = 0; j < 10; j++) {
      continue inner;
    }
  }
}
