# no-gratuitous-expressions

Curly braces can be omitted from a one-line block, such as with an `if` statement or `for` loop, but doing so can be misleading and induce bugs. 

This rule raises an issue when the whitespacing of the lines after a one line block indicates an intent to include those lines in the block, but the omission of curly braces means the lines will be unconditionally executed once.

## Noncompliant Code Example

```typescript
a = false;
if (a) { // Noncompliant
  doSomething(); // never executed
}

if (!a || b) { // Noncompliant; "!a" is always "true", "b" is never evaluated
  doSomething();
} else {
  doSomethingElse(); // never executed
}
```
