import * as ts from "typescript";
import { NotExisting } from "invalid";

export async function test(p: PromiseLike<any>) {

  let x:number = 1;
  let arr = [1, 2, 3];

  await arr;
//^^^^^^^^^ {{Refactor this redundant 'await' on a non-promise.}}

  await x;
//^^^^^^^ {{Refactor this redundant 'await' on a non-promise.}}

  await 1;
//^^^^^^^ {{Refactor this redundant 'await' on a non-promise.}}

  await {else: 42};
//^^^^^^^^^^^^^^^^ {{Refactor this redundant 'await' on a non-promise.}}

  await {then: 42};
//^^^^^^^^^^^^^^^^ {{Refactor this redundant 'await' on a non-promise.}}

  await ({then() { }});

  await Promise.resolve(42);

  await p;

  await new MyPromiseLike();
  await new MyPromiseLike2();

  await new MyPromise();

  await new MyThenable();

  await new NotExisting();

  await returnNumber();

}

class MyPromiseLike implements PromiseLike<any> {
  then(){}
}

class MyPromise implements Promise<any> {
  then(){}
}

class MyPromiseLike2 extends MyPromiseLike {
  then(){}
}

interface Thenable<T> {
  then: () => T
}
class MyThenable implements Thenable<number> {
  then() {
    return 1;
  }
}

function returnNumber(): number | Promise<number> {
  return 1
}
