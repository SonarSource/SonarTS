# no-misleading-array-reverse

Many of JavaScript's Array methods return an altered version of the array while leaving the source array intact.
`reverse` and `sort` are not one of these. Instead, they alter the source array in addition to returning the altered version, which is likely not what was intended. 

To make sure maintainers are explicitly aware of this change to the original array, calls to `reverse()` should be 
standalone statements or preceded by a call that duplicates the original array.

## Noncompliant Code Example

```typescript
let b = a.reverse(); // Noncompliant
a = a.reverse(); // Noncompliant

let d = c.sort(); // Noncompliant
```

## Compliant Code Example

```typescript
let b = [...a].reverse();
a.reverse();

c.sort(); // this sorts array in place
```
