# no-invariant-return

When a method is designed to return an invariant value, it may be poor design, but it shouldn't adversely affect the outcome of your program.
However, when it happens on all paths through the logic, it is surely a bug.

This rule raises an issue when a method contains several `return` statements that all return the same value.

## Noncompliant Code Example

```typescript
function foo(a: number) {  // Noncompliant
  if (a == 1) {
    return 42;
  }
  return 42;
}
```

