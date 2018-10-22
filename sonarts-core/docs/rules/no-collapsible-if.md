# no-collapsible-if

Merging collapsible `if` statements increases the code's readability.

## Noncompliant Code Example

```typescript
if (x != undefined) {
  if (y === 2) {
    // ...
  }
}
```
## Compliant Solution

```typescript
if (x != undefined && y === 2) {
  // ...
}
```

