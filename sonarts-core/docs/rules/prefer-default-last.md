# prefer-default-last

`switch` can contain a `default` clause for various reasons: to handle unexpected values, to show that all the cases were
properly considered.

For readability purpose, to help a developer to quickly find the default behavior of a `switch` statement, it is recommended to put the
`default` clause at the end of the `switch` statement. This rule raises an issue if the `default` clause is not the
last one of the `switch`'s cases.

## Noncompliant Code Example

```typescript
switch (param) {
  default: // default clause should be the last one
    error();
    break;
  case 0:
    doSomething();
    break;
  case 1:
    doSomethingElse();
    break;
}
```
## Compliant Solution

```typescript
switch (param) {
  case 0:
    doSomething();
    break;
  case 1:
    doSomethingElse();
    break;
  default:
    error();
    break;
}
```
## See

<ul>
  <li> MISRA C:2004, 15.3 - The final clause of a switch statement shall be the default clause </li>
  <li> MISRA C++:2008, 6-4-6 - The final clause of a switch statement shall be the default-clause </li>
  <li> MISRA C:2012, 16.4 - Every switch statement shall have a default label </li>
  <li> MISRA C:2012, 16.5 - A default label shall appear as either the first or the last switch label of a switch statement </li>
</ul>

