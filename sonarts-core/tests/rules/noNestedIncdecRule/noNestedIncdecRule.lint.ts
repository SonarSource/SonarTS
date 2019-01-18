export function toCreateModule() {}

import {} from "mymodule";

function bar(foo: number[], i: number) {
  
  i++;
  ++i;
  i--;
  --i;

  foo[i]++;
  foo[i++]++;
//    ^^^  {{Extract this increment operation into a dedicated statement.}}

  foo[i++] = 0;
//    ^^^  {{Extract this increment operation into a dedicated statement.}}
  foo[i--] = 0;
//    ^^^  {{Extract this decrement operation into a dedicated statement.}}
  foo[++i] = 0;
//    ^^^  {{Extract this increment operation into a dedicated statement.}}
  foo[--i] = 0;
//    ^^^  {{Extract this decrement operation into a dedicated statement.}}

  foo[-i] = 0;

  if (i == 1) {
    return i++;
//         ^^^  {{Extract this increment operation into a dedicated statement.}}
  } else if (i == 2) {
    return ++i;
//         ^^^  {{Extract this increment operation into a dedicated statement.}}
  } else if (i == 3) {
    return foo[++i];
//             ^^^  {{Extract this increment operation into a dedicated statement.}}
  } else if (i == 4) {
    throw foo[i++];
//            ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  
  i = i++ - 1;
//    ^^^  {{Extract this increment operation into a dedicated statement.}}

  i = 5 * --i;
//        ^^^  {{Extract this decrement operation into a dedicated statement.}}

  console.log(i++);
//            ^^^  {{Extract this increment operation into a dedicated statement.}}

  let j = 0;
  for (i = 0; i < 10; i++, j++) {
  }

  for (var i = 0; i < 10; i = j++ - 2, i++) {
//                            ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  for (i++ ; i < 10; i++) {
//     ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  for (var i = 0; i++ < 10; i++) {
//                ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  while (i++ > 10) {
//       ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  while (i++) {
  //     ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  do {
  } while (i++);
  //       ^^^  {{Extract this increment operation into a dedicated statement.}}

  for (let el of [foo[i++]]) {
//                    ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  if (i++) {
//    ^^^  {{Extract this increment operation into a dedicated statement.}}
  }

  switch (i++) {
//        ^^^  {{Extract this increment operation into a dedicated statement.}}
    case j++: break;
//       ^^^  {{Extract this increment operation into a dedicated statement.}}
    default: break;
  }
}
