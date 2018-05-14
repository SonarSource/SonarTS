# prefer-promise-shorthand

 When a `Promise` needs to only "resolve" or "reject", it's more efficient and readable to use the methods specially created for such
use cases: `Promise.resolve(value)` and `Promise.reject(error)`.

## Noncompliant Code Example

```typescript
let fulfilledPromise = new Promise(resolve =&gt; resolve(42));
let rejectedPromise = new Promise(function(resolve, reject) {
  reject('fail');
});
```
## Compliant Solution

```typescript
let fulfilledPromise = Promise.resolve(42);
let rejectedPromise = Promise.reject('fail');
```

