if (condition) {
  action1();
  action2();
}

if (condition)
  action1();
  action2();
//^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 2-line block will be. The rest will execute unconditionally.}}

if (condition)
  action1();
  action2();
//^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 4-line block will be. The rest will execute unconditionally.}}
  action3();

if (condition)
  action1();
action2();

if (condition)
  action1();

  action2();
//^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 3-line block will be. The rest will execute unconditionally.}}

if (condition)
  action1();
  action2();
//^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 5-line block will be. The rest will execute unconditionally.}}

  action3();

if (condition)
action1();
action2();

  if (condition)
action1();
action2(); // compliant, less indented

if (condition) action1(); action2();
//                        ^^^^^^^^^^ {{This statement will not be executed conditionally; only the first statement will be. The rest will execute unconditionally.}}

if (condition) action1();
  action2();
//^^^^^^^^^^ {{This line will not be executed conditionally; only the first statement will be. The rest will execute unconditionally.}}

for(var i = 1; i < 3; i++) {
    action1();
    action2();
}

for(var i = 1; i < 3; i++)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed in a loop; only the first line of this 2-line block will be. The rest will execute only once.}}

for(var x in obj)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed in a loop; only the first line of this 2-line block will be. The rest will execute only once.}}

for(var x of obj)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed in a loop; only the first line of this 2-line block will be. The rest will execute only once.}}

while (condition) {
  action1();
  action2();
}

function foo() {
  if (condition) {
    action1();
    action2();
  }

  if (condition)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 2-line block will be. The rest will execute unconditionally.}}
}

while (condition)
  action1();
  action2();
//^^^^^^^^^^ {{This line will not be executed in a loop; only the first line of this 2-line block will be. The rest will execute only once.}}

namespace A {
  if (condition)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 2-line block will be. The rest will execute unconditionally.}}
}

module B {
  if (condition)
    action1();
    action2();
//  ^^^^^^^^^^ {{This line will not be executed conditionally; only the first line of this 2-line block will be. The rest will execute unconditionally.}}
}
