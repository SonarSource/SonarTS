# no-same-line-conditional

Code is clearest when each statement has its own line. Nonetheless, it is a common pattern to combine on the same line an `if` and its resulting `then` statement. However, when an `if` is placed on the same line as the closing `}` from a preceding `else` or `else if`, it is either an error - `else` is missing - or the invitation to a future error as maintainers fail to understand that the two statements are unconnected.

## Noncompliant Code Example
```typescript
if (condition1) {
  // ...
} if (condition2) {  // Noncompliant
  //...
}
```

## Compliant Code Example
```typescript
if (condition1) {
  // ...
} else if (condition2) {
  //...
}
```
Or
```typescript
if (condition1) {
  // ...
}

if (condition2) {
  //...
}
```

