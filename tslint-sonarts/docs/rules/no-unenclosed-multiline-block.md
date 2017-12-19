# no-unenclosed-multiline-block

Curly braces can be omitted from a one-line block, such as with an `if` statement or `for` loop, but doing so can be misleading and induce bugs. 

This rule raises an issue when the whitespacing of the lines after a one line block indicates an intent to include those lines in the block, but the omission of curly braces means the lines will be unconditionally executed once.

## Noncompliant Code Example

```typescript
if (condition)
  firstActionInBlock();
  secondAction();  // Noncompliant; executed unconditionally
thirdAction();

if (condition) firstActionInBlock(); secondAction();  // Noncompliant; secondAction executed unconditionally

if (condition) firstActionInBlock();  // Noncompliant
  secondAction();  // Executed unconditionally

if (condition); secondAction();  // Noncompliant; secondAction executed unconditionally

let str: string|null = null;
for (let i = 0; i < array.length; i++) 
  str = array[i];
  doTheThing(str);  // Noncompliant; executed only on last array element
```

## Compliant Solution

```typescript
if (condition) {
  firstActionInBlock();
  secondAction();
}
thirdAction();

str: string|null = null;
for (let i = 0; i < array.length; i++) {
  str = array[i];
  doTheThing(str);
}
```
