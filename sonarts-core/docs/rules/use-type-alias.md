# use-type-alias

Union and intersection types are very convenient but can make code a bit harder to read and to maintain. So if a particular union or intersection is used in multiple places it is highly recommended to use a type alias.

## Noncompliant Code Example
```typescript
function foo(x:string|null|number) {
  // ...
}
function bar(x:string|null|number) { // Noncompliant
  // ...
}
function zoo(): string|null|number {
  return null;
}
```

## Compliant Solution
```typescript
type MyType = string | null | number;

function foo(x: MyType) {
  // ...
}
function bar(x: MyType) {
  // ...
}
function zoo():  MyType {
  return null;
}
```
