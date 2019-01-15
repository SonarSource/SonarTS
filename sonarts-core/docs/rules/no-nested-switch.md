# no-nested-switch

Nested `switch` structures are difficult to understand because you can easily confuse the cases of an inner `switch` as
belonging to an outer statement. Therefore nested `switch` statements should be avoided.

Specifically, you should structure your code to avoid the need for nested `switch` statements, but if you cannot, then consider moving
the inner `switch` to another function.

## Noncompliant Code Example

```typescript
function foo(n: number, m: number) {
  switch (n) {
    case 0:
      switch (m) {  // Noncompliant; nested switch
        // ...
      }
    case 1:
      // ...
    default:
      // ...
  }
}
```
## Compliant Solution

```typescript
function foo(n: number, m: number) {
  switch (n) {
    case 0:
      bar(m);
    case 1:
      // ...
    default:
      // ...
  }
}

function bar(m: number) {
  switch(m) {
    // ...
  }
}
```

