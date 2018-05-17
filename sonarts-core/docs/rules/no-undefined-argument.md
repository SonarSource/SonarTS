# no-undefined-argument

Unlike in JavaScript, where every parameter can be omitted, in TypeScript you need to explicitly declare this in the function signature. Either you
add `?` in the parameter declaration and `undefined` will be automatically applied to this parameter. Or you add an initializer
with a default value in the parameter declaration. In the latter case, when passing `undefined` for such parameter, default value will be
applied as well. So it's better to avoid passing `undefined` value to an optional or default parameter because it creates more confusion
than it brings clarity. Note, that this rule is only applied to the last arguments in function call.

## Noncompliant Code Example

```typescript
function foo(x: number, y: string = "default", z?: number) {
  // ...
}

foo(42, undefined); // Noncompliant
foo(42, undefined, undefined); // Noncompliant
foo(42, undefined, 5); // OK, there is no other way to force default value for second parameter
```
## Compliant Solution

```typescript
function foo(x: number, y: string = "default", z?: number) {
  // ...
}

foo(42);
```

