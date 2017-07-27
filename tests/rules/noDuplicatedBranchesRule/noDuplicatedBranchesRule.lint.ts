// tslint:disable

let a, b, first, second, third;

/*
 * NOK IF
 */

if (a) {
  first();
  second();
} else {
  // [12:7-16:1] {{This branch's code block is the same as the block for the branch on line 9.}}
  first();
  second();
}

if (a) {
  first();
  second();
} else if (b) {
  // [21:14-25:1] {{This branch's code block is the same as the block for the branch on line 18.}}
  first();
  second();
}

if (a) {
  first();
  second();
} else if (b) {
  second();
  third();
} else {
  // [33:7-37:1] {{This branch's code block is the same as the block for the branch on line 27.}}
  first();
  second();
}

/*
 * OK IF
 */

if (a) {
  first(`const`);
} else {
  first(`var`);
}

// ok, small branches
if (a) {
  first();
} else {
  first();
}

if (a) {
  first();
  first();
} else {
  second();
  second();
}

if (a) {
  first();
  second();
} else {
  second();
  first();
}

if (a) {
  first();
  second();
} else {
  first();
  third();
}

if (a) {
  first();
  second();
} else {
  first();
}

/*
 * NOK SWITCH
 */

switch (a) {
  case 1:
    first();
    second();
    break;
  default:
    // [96:2-99:13] {{This case's code block is the same as the block for the case on line 92.}}
    first();
    second();
}

switch (a) {
  case 1:
    first();
    second();
    break;
  case 2:
    // [107:2-111:10] {{This case's code block is the same as the block for the case on line 103.}}
    first();
    second();
    break;
}
switch (a) {
  case 1:
    first();
    first();
    break;
  case 2:
    second();
    second();
    break;
  case 3:
    // [122:2-126:10] {{This case's code block is the same as the block for the case on line 114.}}
    first();
    first();
    break;
}

/*
 * OK SWITCH
 */

// ok, small
(function() {
  switch (a) {
    case 1:
      return first();
    default:
      return first();
  }
})();

switch (a) {
  case 1: {
    // comment
    break;
  }
  case 2: {
    // comment
    break;
  }
}

switch (a) {
  case 1:
    first();
    second();
    break;
  default:
    second();
    first();
}

switch (a) {
  case 1:
    first();
    second();
    break;
  case 2:
    third();
}

switch (a) {
  case 1: {
    first();
    second();
    break;
  }
  default: {
    // [179:2-183:3] {{This case's code block is the same as the block for the case on line 174.}}
    first();
    second();
  }
}

// check that for each branch we generate only one issue
switch (a) {
  case 1:
    first();
    second();
    break;
  case 2:
    // [192:2-196:10] {{This case's code block is the same as the block for the case on line 188.}}
    first();
    second();
    break;
  case 3:
    // [197:2-201:10] {{This case's code block is the same as the block for the case on line 188.}}
    first();
    second();
    break;
  case 4:
    // [202:2-206:10] {{This case's code block is the same as the block for the case on line 188.}}
    first();
    second();
    break;
}
