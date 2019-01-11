# no-try-promise

An exception (including `reject`) thrown by a promise will not be caught be a nesting `try` block, due to the asynchronous
nature of execution. Instead, use `catch` method of `Promise` or wrap it inside `await` expression.

Rule reports `try-catch` statements containing nothing else but call(s) to a function returning `Promise` (thus it's less
likely that `catch` is intended to catch something else than `Promise` rejection).

## Noncompliant Code Example

```typescript
function runPromise() {
  return Promise.reject("rejection reason");
}

function foo() {
  try { // Noncompliant, the catch clause of the 'try' will not be executed for the code inside promise
    runPromise();
  } catch (e) {
    console.log("Failed to run promise", e);
  }
}
```

## Compliant Solution

```typescript
function foo() {
  runPromise().catch(e =&gt; console.log("Failed to run promise", e));
}

// or
async function foo() {
  try {
    await runPromise();
  } catch (e) {
    console.log("Failed to run promise", e);
  }
}
```
