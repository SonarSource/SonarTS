export function toCreateModule() {}

try {} catch(e) {}

try {} catch (e) {
  foo();
  throw e;
}

try {} catch (e) {
  if (x) {
    throw e;
  }
}

try {} catch (e) { throw "foo";}

try {} catch (e) { throw new Error("improve error message"); }

try {} catch (e) { throw e; }
//     ^^^^^{{Add logic to this catch clause or eliminate it and rethrow the exception automatically.}}

try {} catch (e) {
//     ^^^^^{{Add logic to this catch clause or eliminate it and rethrow the exception automatically.}}
// some comment
  throw e;
}

try {
  doSomething();
} catch (e) {
//^^^^^{{Add logic to this catch clause or eliminate it and rethrow the exception automatically.}}
  throw e;
} finally {
  // ...
}

try { } catch { throw "SomeError"; }