declare class Bluebird {
  static resolve: () => Bluebird;
  then() {}
}

async function definetlyNotPromise() {
  try {
    return 12;
  } catch {
  }
}

const warn = () => {
  try {
    return (() => Promise.reject(new Error('reason')))(); //should propose await
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Consider using 'await' for the promise(s) inside this 'try' or replace it with 'Promise.catch'.}}
  } catch {
  }
};

const noReturn = () => {
  try {
    // should not propose insert await
    Promise.all([Promise.reject('123')])
      .then(x => x);
  } catch {
  }
};

const otherScope = () => {
  try {
    function f() {
      return Promise.resolve();
    }
  } catch {
  }
};
const awaitExists = async () => {
  try {
    return await Promise.resolve();
  } catch {
  }
};
const customPromise = () => {
  try {
    return Bluebird.resolve();
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^ {{Consider using 'await' for the promise(s) inside this 'try' or replace it with 'Promise.catch'.}}
  } catch {
  }
};


const emptyReturnJustCheckNotBroken = () => {
  try {
    return;
  } catch {
  }
};
