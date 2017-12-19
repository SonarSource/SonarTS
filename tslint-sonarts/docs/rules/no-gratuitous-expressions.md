# no-gratuitous-expressions

If an expression doesn't change the evaluation of the condition, then it is either unnecessary, and condition can be removed, or it makes some code being never executed. In any case, the code should be refactored.

## Noncompliant Code Example

```typescript
function checkState(state: boolean) {
  if (state) {
    console.log("Checking the state");
    if (state) { // Noncompliant, condition is always true
      doSomething();
    }
  }
}
```
