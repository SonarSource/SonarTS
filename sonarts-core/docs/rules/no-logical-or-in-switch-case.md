# no-logical-or-in-switch-case

The logical OR operator (`||`) will not work in a `switch` `case` as one might think, only the first argument will be considered at execution time.

## Noncompliant Code Example
```typescript
switch (x) {
  case 1 || 2: // Noncompliant; only '1' is handled
    doSomething(x);
    break;
  case 3:
    doAnotherThing(x);
    break;
  default:
    console.log("Boom!");  // this happens when x is 2
}
```

## Compliant Solution
```typescript
switch (x) {
  case 1:
  case 2:
    doSomething(x);
    break;
  case 3:
    doAnotherThing(x);
    break;
  default:
    console.log("Boom!");
}
```
