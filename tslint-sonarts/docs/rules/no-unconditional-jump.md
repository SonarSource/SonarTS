# no-unconditional-jump

Having an unconditional `break`, `return` or `throw` in a loop renders it useless; the loop will only execute once and the loop structure itself is simply wasted keystrokes.
Having an unconditional `continue` in a loop is itself wasted keystrokes.
For these reasons, unconditional jump statements should never be used except for the final `return` in a function or method.

## Noncompliant Code Example

```typescript
for (i = 0; i < 10; i++) {
  console.log("i is " + i);
  break;  // loop only executes once
}

for (i = 0; i < 10; i++) {
  console.log("i is " + i);
  continue;  // this is meaningless; the loop would continue anyway
}

for (i = 0; i < 10; i++) {
  console.log("i is " + i);
  return;  // loop only executes once
}
```

## Compliant Solution

```typescript
for (i = 0; i < 10; i++) {
  console.log("i is " + i);
}
```