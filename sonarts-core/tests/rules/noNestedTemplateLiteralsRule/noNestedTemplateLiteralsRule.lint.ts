function fooNestedTemplateLiterals() {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${count} ${color}` : count} apples`;
  //                              ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function fooNestedTemplateLiterals2(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${x ? `indeed 0` : count} ${color}` : count} apples`;
  // [11:34-11:70] {{Extract this template literal into a dedicated statement.}}
  // [11:41-11:51] {{Extract this template literal into a dedicated statement.}}
}

function fooNestedTemplateLiterals3(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${x ? `indeed ${0}` : count} ${color}` : count} apples`;
  // [19:34-19:73] {{Extract this template literal into a dedicated statement.}}
  // [19:41-19:54] {{Extract this template literal into a dedicated statement.}}
}

function fooNestedTaggedTemplateLiterals(x: number) {
  let color = "red";
  let count = 3;
  let message = tag1`I have ${color ? tag2`${count} ${color}` : count} apples`;
  //                                      ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function fooNestedTaggedTemplateLiterals2(x: number) {
  let color = "red";
  let count = 3;
  let message = tag1`I have ${color ? `${count} ${color}` : count} apples`;
  //                                  ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function tag1(strings: any, ...keys: any[]) {
  console.log(strings[2]);
}

function tag2(strings: any, ...keys: any[]) {
  console.log(strings[2]);
}

function barNestedTemplateLiterals() {
  let color = "red";
  let count = 3;
  let nestedMessage = `${count} ${color}`;
  let message = `I have ${color ? nestedMessage : count} apples`;
}
