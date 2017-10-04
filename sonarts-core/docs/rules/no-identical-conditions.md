# no-identical-conditions

A `switch` and a chain of `if`/`else if` statements is evaluated from top to bottom. At most, only 
one branch will be executed: the first one with a condition that evaluates to `true`.

Therefore, duplicating a condition automatically leads to dead code. Usually, this is due to a 
copy/paste error. At best, it's simply dead code and at worst, it's a bug that is likely to induce 
further bugs as the code is maintained, and obviously it could lead to unexpected behavior.

For a `switch`, if the first case ends with a `break`, the second case will never be executed, 
rendering it dead code. Worse there is the risk in this situation that future maintenance will be 
done on the dead case, rather than on the one that's actually used.

On the other hand, if the first case does not end with a `break`, both cases will be executed, 
but future maintainers may not notice that.

## Noncompliant Code Example

```typescript
if (param == 1)
  openWindow();
else if (param == 2)
  closeWindow();
else if (param == 1)  // Noncompliant
  moveWindowToTheBackground();

switch (i) {
  case 1:
    //...
    break;
  case 3:
    //...
    break;
  case 1:  // Noncompliant
    //...
    break;
  default:
    // ...
    break;
}
```