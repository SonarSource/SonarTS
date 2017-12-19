# use-type-alias

Union and intersection types are very convenient but can make code a bit harder to read and to maintain. So if a particular union or intersection is used in multiple places it is highly recommended to use a type alias.

## Noncompliant Code Example
```typescript
function foo(x: string | number | null) { // Noncompliant
  // ...
}

function bar(x: string | number | null) {
  // ...
}

function zoo(): string | number | null {
  // ...
}
```

## Compliant Solution
```typescript
type MyType = string | number | null;

function foo(x: MyType) {
  // ...
}

function bar(x: MyType) {
  // ...
}

function zoo(): MyType {
  // ...
}
```
