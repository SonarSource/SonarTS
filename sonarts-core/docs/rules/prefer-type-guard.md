# prefer-type-guard

A common idiom in JavaScript to differentiate between two possible types is to check for the presence in the object of a member of the desired
type. Usually, to simplify the code, a boolean function is created to check the type.

Typescript provides user defined type guard functions. These are just functions with a return type of `argumentName is SomeType`. Such
functions return `true` if the argument is of the specified type. One of the advantages of using such a function is that in a conditional
block where the condition is a type guard, the compiler automatically performs the appropriate casts, so explicit casting becomes unnecessary.

This rule raises an issue when a boolean function checking for the type of its only argument can be replaced with a user-defined type guard
function.

## Noncompliant Code Example

```typescript
function isSomething(x: BaseType) : boolean { // Noncompliant
  return (&lt;Something&gt;x).foo !== undefined;
}

if (isSomething(v)) {
  (&lt;Something&gt;v).foo();
}
```
## Compliant Solution

```typescript
function isSomething(x: BaseType) : x is Something {
  return (&lt;Something&gt;x).foo !== undefined;
}

if (isSomething(v)) {
  v.foo();
}
```
## See

<a href="https://www.typescriptlang.org/docs/handbook/advanced-types.html">TypeScript advanced types</a>


