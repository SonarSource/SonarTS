export function toCreateModule() {}

import * as something from "somewhere";

function noStatementsSameLine(a: number, b: number) {

  alert("Hello World!"); alert("Hello World!");
//                       ^^^^^^^^^^^^^^^^^^^^^^ {{Reformat the code to have only one statement per line.}}
  alert("Hello World!"); alert("Hello World!"); alert("Hello World!");
//                       ^^^^^^^^^^^^^^^^^^^^^^ {{Reformat the code to have only one statement per line.}}  

  if (a) {}

  if (a) {} if (b) {} 
//          ^^^^^^^^^ {{Reformat the code to have only one statement per line.}}

  while (a);

  label: while (a) {
    break label;
  }

  if (a) { alert();
//         ^^^^^^^^ {{Reformat the code to have only one statement per line.}}
      }
    
  if (a) { alert(); alert(); }
//         ^^^^^^^^ {{Reformat the code to have only one statement per line.}}

  if (a) alert(); alert();
//                ^^^^^^^^ {{Reformat the code to have only one statement per line.}}  
  if (a
      && b) alert(); alert();
//                   ^^^^^^^^ {{Reformat the code to have only one statement per line.}}
    

  [1, 2, 3].forEach(function () {
    // OK - exception
    [1, 2, 3]
      .map(function (e) { return e; }) 
      .filter(function (e) { return e; });
    [1, 2, 3].map(function (e) { return e; });


    [1, 2, 3].map(function (e) { alert(e);
//                               ^^^^^^^^^ {{Reformat the code to have only one statement per line.}}
      return e; 
    });

    [1, 2, 3]
      .map(function (e) { alert(e); // FN
        return e; 
      });

    [1, 2, 3].map(
      function (e) { alert(e);
        return e; 
      }
    );

  });

  // more exceptions
  if (a) alert();
  if (a) { alert(); }
  while (a) alert();
  do alert(); while(a);
  for(let x in []) alert();
  for(let x of []) alert();
  for(let i = 0; i < 0; i++) alert();
  alert(function(){bar;});
  alert(function * (): IterableIterator<number> {bar;});
  alert(() => {bar;});

}



