# no-return-type-any

The return type `any` should be avoided because it prevents the type safety checks normally done by the compiler. When 
a function returns a primitive type (i.e. number, string or boolean) it is safe to replace `any` with `number`, 
`string` or `boolean` type respectively, or remove the return type completely and let compiler infer it.

## Noncompliant Code Example
```typescript
function foo(): any { // Noncompliant
  return 1;
}
```

## Compliant Solution
```typescript
function foo(): number {
  return 1;
}
// or
function foo() {
  return 1;
}
```
