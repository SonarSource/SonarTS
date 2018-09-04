# no-inverted-boolean-check

It is needlessly complex to invert the result of a boolean comparison. The opposite comparison should be made instead.

## Noncompliant Code Example

```typescript
if ( !(a == 2)) { ... }  // Noncompliant
```

## Compliant Solution

```typescript
if (a != 2) { ... }
```
