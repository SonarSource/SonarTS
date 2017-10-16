var x = "";

if (x.length) {
} if (x.length) {
//^^ {{Move this "if" to a new line or add the missing "else".}}
}

if (x.length) {
} else {
} if (x.length) {
//^^ {{Move this "if" to a new line or add the missing "else".}}
}


if (x.length) {
} else if (x.length) {
}

function foo() {
  if (x.length) {
  } if (x.length) {
//  ^^ {{Move this "if" to a new line or add the missing "else".}}
  }
}