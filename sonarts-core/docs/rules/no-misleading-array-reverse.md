# no-misleading-array-reverse

Many of JavaScript's `Array` methods return an altered version of the array while leaving the source array intact. 
`Array.reverse()` is not one of those. Instead it alters the source array *in addition* to returning the altered version.

To make sure maintainers are explicitly aware of this change to the original array, calls to `reverse()` should be 
standalone statements or preceded by a call that duplicates the original array.

## Noncompliant Code Example

```typescript
let b = a.reverse(); // Noncompliant

a = a.reverse(); // Noncompliant
```

## Compliant Code Example

```typescript
let b = [...a].reverse();

a.reverse();
```
