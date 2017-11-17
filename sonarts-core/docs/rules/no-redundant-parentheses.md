# no-redundant-parentheses

The use of parentheses, even those not required to enforce a desired order of operations, can clarify the intent behind a piece of code. But redundant pairs of parentheses could be misleading, and should be removed.

## Noncompliant Code Example

```typescript
let x = (y / 2 + 1);   // Compliant even if those parenthesis are useless for the compiler

if (a && ((x+y > 0))) {  // Noncompliant
  //...
}

return ((x + 1));  // Noncompliant
```

## Compliant Solution

```typescript
let x = (y / 2 + 1);

if (a && (x+y > 0)) {
  //...
}

return (x + 1);
```
