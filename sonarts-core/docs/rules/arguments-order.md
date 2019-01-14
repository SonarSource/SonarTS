# arguments-order

When the names of parameters in a method call match the names of the method arguments, it contributes to clearer, more readable code. However, when
the names match, but are passed in a different order than the method arguments, it indicates a mistake in the parameter order which will likely lead
to unexpected results.

## Noncompliant Code Example

```typescript
public double divide(int divisor, int dividend) {
  return divisor/dividend;
}

public void doTheThing() {
  int divisor = 15;
  int dividend = 5;

  double result = divide(dividend, divisor);  // Noncompliant; operation succeeds, but result is unexpected
  //...
}
```
## Compliant Solution

```typescript
public double divide(int divisor, int dividend) {
  return divisor/dividend;
}

public void doTheThing() {
  int divisor = 15;
  int dividend = 5;

  double result = divide(divisor, dividend);
  //...
}
```

