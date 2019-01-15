# bool-param-default

Having default value for optional boolean parameters makes the logic of function when missing that parameter more evident.

## Noncompliant Code Example

```typescript
function countPositiveNumbers(arr: number[], countZero?: boolean) {
  // ...
}
```
## Compliant Solution

```typescript
function countPositiveNumbers(arr: number[], countZero: boolean = false) {
  // ...
}
```

