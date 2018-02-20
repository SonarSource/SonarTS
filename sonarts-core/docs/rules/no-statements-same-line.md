# no-statements-same-line

For better readability, do not put more than one statement on a single line.

## Noncompliant Code Example

```typescript
foo(); bar(); // Noncompliant
```
## Compliant Solution

```typescript
foo();
bar();
```
## Exceptions

Anonymous functions containing a single statement are ignored. Control flow statements with a single nested statement are ignored as well.

```typescript
onEvent(function() { doSomething(); });               // Compliant
onEvent(function(p) { doSomething(); return p % 2; }); // Noncompliant

if (condition) doSomething();                         // Compliant
if (condition) { doSomething(); }                     // Compliant
```

