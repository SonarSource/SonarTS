// tslint:disable

let a, b, first, second, third;

/*
 * NOK IF
 */

   if (a) { first(); } else { first(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}

   if (a) { first(); } else if (b) { first(); } else { first(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}

   if (a) { first(); second(); } else { first(); second(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}
   
   if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); second(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}


/*
 * OK IF
 */

if (a) { first(`const`); } else { first(`var`); }



if (a) { first(); } else { second(); }

if (a) { first(); } else if (b) { second(); }

if (a) { second(); } else if (b) { first(); } else { first(); }
if (a) { first(); } else if (b) { second(); } else { first(); }
if (a) { first(); } else if (b) { first(); } else { second(); }

if (a) { first(); second(); } else { second(); first(); }
if (a) { first(); second(); } else { first(); third(); }
if (a) { first(); second(); } else { first(); }

if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); third(); }

function render() {
  if (a) {
    return <p>foo</p>;
  } else {
    return <p>bar</p>;
  }
}


/*
 * NOK SWITCH
 */

   switch (a) { case 1: first(); second(); break; default: first(); second(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}

   switch (a) { case 1: first(); second(); break; case 2: first(); second(); break; default: first(); second(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}

   switch (a) { case 1: first(); break; case 2: first(); break; default: first(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}

   switch (a) { case 1: case 2: first(); second(); break; case 3: first(); second(); break; default: first(); second(); }
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Remove this conditional structure or edit its code blocks so that they're not all the same.}}


/*
 * OK SWITCH
 */

// Ok, no default
switch (a) { case 1: first(); second(); break; case 2: case 3: first(); second(); }

// Ok, different branches
switch (a) { case 1: first(); second(); break; case 3: first(); second(); break; default: third(); }
switch (a) { case 1: first(); second(); break; case 2: first(); second(); break; default: }


/*
 * NOK TERNARY
 */

   a ? first : first;
// ^^^^^^^^^^^^^^^^^ {{This conditional operation returns the same value whether the condition is "true" or "false".}}


/*
 * OK TERNARY
 */
a ? first : second;
