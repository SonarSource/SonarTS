// tslint:disable
let i = 42;
let a = {b: 42};

i = i++;
//   ^^ {{Remove this increment or correct the code not to waste it.}}

a.b = a.b++;
//       ^^ {{Remove this increment or correct the code not to waste it.}}

i = i--;
//   ^^ {{Remove this decrement or correct the code not to waste it.}}

i++;
a.b++;
i = ++i;
--i;
