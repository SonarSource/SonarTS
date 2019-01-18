function nokNestedTemplateLiterals() {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${count} ${color}` : count} apples`;
  //                              ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTemplateLiterals2(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${x ? `indeed 0` : count} ${color}` : count} apples`;
  // [11:34-11:70] {{Extract this template literal into a dedicated statement.}}
  // [11:41-11:51] {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTemplateLiterals3(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${x ? `indeed ${0}` : count} ${color}` : count} apples`;
  // [19:34-19:73] {{Extract this template literal into a dedicated statement.}}
  // [19:41-19:54] {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTaggedTemplateLiterals(x: number) {
  let color = "red";
  let count = 3;
  let message = tag1`I have ${color ? tag2`${count} ${color}` : count} apples`;
  //                                      ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTaggedTemplateLiterals2(x: number) {
  let color = "red";
  let count = 3;
  let message = tag1`I have ${color ? `${count} ${color}` : count} apples`;
  //                                  ^^^^^^^^^^^^^^^^^^^ {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTemplateLiteralsTernary(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${color ? `${count} ${color}` : `this is ${count}`} apples`;
  // [41:34-41:53] {{Extract this template literal into a dedicated statement.}}
  // [41:56-41:74] {{Extract this template literal into a dedicated statement.}}
}

function nokNestedTemplateLiteralsMultiple(x: number) {
  let color = "red";
  let count = 3;
  let message = `I have ${`${count} ${color}`} ${`this is ${count}`} apples`;
  // [49:26-49:45] {{Extract this template literal into a dedicated statement.}}
  // [49:49-49:67] {{Extract this template literal into a dedicated statement.}}
}

function tag1(strings: any, ...keys: any[]) {
  console.log(strings[2]);
}

function tag2(strings: any, ...keys: any[]) {
  console.log(strings[2]);
}

function okNestedTemplateLiterals() {
  let color = "red";
  let count = 3;
  let nestedMessage = `${count} ${color}`;
  let message = `I have ${color ? nestedMessage : count} apples`;
}

export function toCreateModule() {}
