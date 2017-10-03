# no-inconsistent-return

In TypeScript a function can return a value explicitly, by using a `return` statement with a value, or implicitly, at the end of the function or by a `return` with no value, resulting in the function returning `undefined`. Implicit returns of `undefined` not declared in the function signature, can be confusing for the maintainer.
This rule ensures that `return`s are either all explicit or all implicit, or the function signatures makes the implicit `return` obvious.

## Noncompliant Code Example

```typescript
function foo(a) { // Noncompliant, function exits without "return"
  if (a == 1) {
    return true;
  }
}
```

## Compliant Solution

```typescript
function foo(a): boolean | undefined {
  if (a == 1) {
    return true;
  }
}
```
