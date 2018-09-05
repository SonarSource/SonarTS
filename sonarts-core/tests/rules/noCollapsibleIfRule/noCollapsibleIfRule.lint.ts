  if (x) {
    console.log(x);
  }

  if (x) {
//^^ > {{Enclosing "if" statement}}
      if (y) {}
//    ^^ {{Merge this if statement with the enclosing one.}}
  }

  if (x) { 
    if (y) {}
    console.log(x);
  }

  if (x) { 
    console.log(x);
    if (y) {}
  }

  if (x) { 
    if (y) {}
  } else {
  }

  if (x) { 
    if (y) {
    } else {
    }
  }

  if (x)
    if (y) {
//  ^^ {{Merge this if statement with the enclosing one.}}        
    }

  if (x) {
    if (y) {
//  ^^ {{Merge this if statement with the enclosing one.}}
      if (z) {
//    ^^ {{Merge this if statement with the enclosing one.}}
      }
    }
  }
