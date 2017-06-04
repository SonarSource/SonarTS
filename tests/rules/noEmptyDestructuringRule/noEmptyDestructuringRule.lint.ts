// tslint:disable

let a, b, first, second, third;

var {} = obj;
//  ^^                       {{Change this pattern to not be empty.}}

var [] = obj;
//  ^^                       {{Change this pattern to not be empty.}}

var { prop: {} } = obj;
//          ^^             {{Change this pattern to not be empty.}}

var { prop: [] } = obj;
//          ^^              {{Change this pattern to not be empty.}}

function foo1({}) { }
//            ^^             {{Change this pattern to not be empty.}}

function foo2([]) { }
//            ^^             {{Change this pattern to not be empty.}}

function foo3({ prop: {} }) { }
//                    ^^     {{Change this pattern to not be empty.}}

function foo4({ prop: [] }) { }
//                    ^^     {{Change this pattern to not be empty.}}

var obj = {}; // empty object literal

var arr = []; // empty array literal

var [el1, el2] = arr;
