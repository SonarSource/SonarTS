# bool-param-default

Having default value for optional boolean parameters makes the logic of function when missing that parameter more evident. When providing a default value is not possible, it is better to split the function into two with a clear responsibility separation.

## Noncompliant Code Example

```typescript
function countPositiveNumbers(arr: number[], countZero?: boolean) { // Noncompliant, default value for 'countZero' should be defined
  // ...
}

function toggleProperty(property: string, value?: boolean) { // Noncompliant, a new function should be defined
  if (value !== undefined) {
    setProperty(property, value);
  } else {
    setProperty(property, calculateProperty());
  }
}
```
## Compliant Solution

```typescript
function countPositiveNumbers(arr: number[], countZero = false) {
  // ...
}

function toggleProperty(property: string, value: boolean) {
  setProperty(property, value);
}

function togglePropertyToCalculatedValue(property: string) {
  setProperty(property, calculateProperty());
}
```

