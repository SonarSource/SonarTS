export function toCreateModule() {}

let fulfilledPromise = new Promise(resolve => resolve(calc(42)));
//                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Replace this trivial promise with "Promise.resolve(calc(42))".}}
let rejectedPromise = new Promise((resolve, reject) => reject(new Error('fail')));
//                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Replace this trivial promise with "Promise.reject(new Error('fail'))".}}

fulfilledPromise = new Promise(r => r(42));
//                 ^^^^^^^^^^^^^^^^^^^^^^^ {{Replace this trivial promise with "Promise.resolve(42)".}}
fulfilledPromise = new Promise(function(resolve) { resolve(42);});
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Replace this trivial promise with "Promise.resolve(42)".}}


fulfilledPromise = new Promise(resolve => { resolve(calc(42));  console.log("foo");}); 
fulfilledPromise = Promise.resolve(42)
rejectedPromise = Promise.reject('fail');

function calc(x:number): number { return x * 2 }


let somePromise = new Promise(); // compilation error (semantic level)
somePromise = new Promise(() => { calc(42); });  // 0 parameters
