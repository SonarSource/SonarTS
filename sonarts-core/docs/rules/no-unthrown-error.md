# no-unthrown-error

Creating a new `Error` without actually throwing it is useless and is probably due to a mistake.

## Noncompliant Code Example

```typescript
if (x < 0) {
  new Error("x must be nonnegative");
}
```

## Compliant Solution

```typescript
if (x < 0) {
  throw new Error("x must be nonnegative");
}
```