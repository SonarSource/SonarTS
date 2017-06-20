# no-empty-destructuring

Destructuring is a convenient way of extracting multiple values from data stored in 
(possibly nested) objects and arrays. However, it is possible to create an empty pattern that has 
no effect. When empty curly braces or brackets are used to the right of a property name most of the 
time the intent was to use a default value instead.

This rule raises an issue when empty destructuring pattern is used.

## Noncompliant Code Example

```typescript
var { a: {}, b } = myObj; // Noncompliant
function foo({ first: [], second }) { // Noncompliant
  // ...
}
```

## Compliant Solution

```typescript
var { a = {}, b } = myObj;
function foo({ first = [], second }) {
  // ...
}
```
