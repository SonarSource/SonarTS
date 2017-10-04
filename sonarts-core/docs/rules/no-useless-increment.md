# no-useless-increment

A value that is incremented or decremented and then not stored is at best wasted code and at worst a bug.

## Noncompliant Code Example
```typescript
let i = 0;
i = i++; // Noncompliant; i is still zero
```

## Compliant Solution
```typescript
let i = 0;
i++;
```
