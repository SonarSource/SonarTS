# no-impossible-intersection

An intersection type combines multiple types into one. This allows you to add together existing types to get a single type that has all the features you need. However if the combined types are mutually exclusive, then the intersection is empty and no type can match it. This is almost certainly an error.

## Noncompliant Code Example

```typescript
function foo(p: number & null) { // Noncompliant
 // ...
}
```
