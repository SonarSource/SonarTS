# no-ignored-initial-value

While it is technically correct to assign to parameters from within function bodies, doing so before the parameter value is read is likely a bug. Instead, initial values of parameters, caught exceptions, and foreach parameters should be, if not treated as read-only, then at least read before reassignment.

## Noncompliant Code Example

```typescript
function doTheThing(str : string, i: number, strings: string[]) {
  str = i.toString();  // Noncompliant

  for (let s in strings) {
    s = "hello world" + str;  // Noncompliant
    console.log(s);
  }
}
```
