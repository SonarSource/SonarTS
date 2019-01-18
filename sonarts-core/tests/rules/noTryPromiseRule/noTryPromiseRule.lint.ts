export function someFunc() {

}

function returningPromise() {
  return Promise.reject();
}

function singlePromise() {
  try {
//^^^ {{Consider using 'await' for the promise inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage.}}
    returningPromise();
// [12:4-12:22] < {{Promise}}
  } catch (e) {
    console.log(e);
  }
}

function conditionalPromise(cond: boolean) {
  try {
//^^^ {{Consider using 'await' for the promises inside this 'try' or replace it with 'Promise.prototype.catch(...)' usages.}}
    if (cond) {
      returningPromise();
  // [23:6-23:24] < {{Promise}}
    } else {
      let x = 42;
      returningPromise();
  // [27:6-27:24] < {{Promise}}
    }
  } catch (e) {
    console.log(e);
  }
}

async function okWithAwait() {
  try {
    await returningPromise();
  } catch (e) {
    console.log(e);
  }
}

function okWithAnotherCall() {
  try {
    someFunc(); // can throw potentionally 
    returningPromise();
  } catch (e) {
    console.log(e);
  }
}

function okWithoutCatch() {
  try {
    returningPromise();
  } finally {
    console.log("finally");
  }
}

async function severalTry() {
  try {
    await returningPromise();
  } catch (e) {
    console.log(e);
  }

  try {
//^^^ {{Consider using 'await' for the promise inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage.}}
    returningPromise();
  } catch (e) {
    console.log(e);
  }
}

function newPromise() {
  try {
//^^^ {{Consider using 'await' for the promise inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage.}}
    new Promise((res, rej) => {});
// [78:4-78:33] < {{Promise}}
  } catch (e) {
    console.log(e);
  }
}

function okWithNestedFunc() {
  try {
    let func = () => returningPromise();
  } catch (e) {
    console.log(e);
  }
}

function returningPromiseAndThrowing(cond: boolean) {
  if (cond) {
    return new Promise((res, rej) => {});
  } else {
    throw "error";
  }
}

// can be considered as False Positive as `returningPromiseAndThrowing` can throw
function testFunctionReturningPromiseAndThrowing(cond: boolean) {
  try {
//^^^ {{Consider using 'await' for the promise inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage.}}
    returningPromiseAndThrowing(cond);
  } catch (e) {
    console.log(e);
  }
}

function uselessTry() {
  try {
//^^^ {{Consider removing this 'try' statement as promise rejection is already captured by '.catch()' method.}}
    returningPromise().catch();
//  ^^^^^^^^^^^^^^^^^^ < {{Caught promise}}
  } catch (e) {
    console.log(e);
  }
}

function uselessTryThenCatch() {
  try {
//^^^ {{Consider removing this 'try' statement as promise rejection is already captured by '.catch()' method.}}
    returningPromise().then().catch();
//  ^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Caught promise}}
  } catch (e) {
    console.log(e);
  }
}

function onlyOnePromiseWhenChainedPromise() {
  try {
//^^^ {{Consider using 'await' for the promise inside this 'try' or replace it with 'Promise.prototype.catch(...)' usage.}}
    returningPromise().then(() => {});
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ < {{Promise}}
  } catch (e) {
    console.log(e);
  }
}

async function okWithAwaitAndPromise() {
  try {
    await returningPromise(); // this can throw
    returningPromise();
  } catch (e) {
    console.log(e);
  }
}