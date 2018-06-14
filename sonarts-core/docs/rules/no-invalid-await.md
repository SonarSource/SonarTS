# no-invalid-await

It is possible to use `await` on values which are not `Promise`s, but it's useless and misleading. The point of
`await` is to pause execution until the `Promise`'s asynchronous code has run to completion. With anything other than a
`Promise`, there's nothing to wait for.

This rule raises an issue when an `await`ed value is guaranteed not to be a `Promise`.

## Noncompliant Code Example

```typescript
let x = 42;
await x; // Noncompliant
```
## Compliant Solution

```typescript
let x = new Promise(resolve =&gt; resolve(42));
await x;

let y = p ? 42 : new Promise(resolve =&gt; resolve(42));
await y;
```

