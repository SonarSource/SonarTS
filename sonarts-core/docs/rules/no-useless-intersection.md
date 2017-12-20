# no-useless-intersection

An intersection type combines multiple types into one. This allows you to add together existing types to get a single 
type that has all the features you need. However an intersection with a type without members doesn't change the 
resulting type. This is almost certainly an error.

## Noncompliant Code Example

```typescript
function foo(p: MyType & null) { // Noncompliant
 // ...
}
```

## Compliant Solution

```typescript
function foo(p: MyType | null) {
 // ...
}
// or
function foo(p: MyType & AnotherType) {
 // ...
}
```
