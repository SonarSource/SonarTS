# no-variable-usage-before-declaration

One of the biggest sources of confusion for JavaScript beginners is scoping. The reason scoping is 
so confusing in JavaScript is because JavaScript looks like a C-family language but doesn't act 
like one. C-family languages have block-level scope, meaning that when control enters a block, 
such as an `if` statement, new variables can be declared within that scope without affecting the 
outer scope. However, this is not the case in JavaScript.

To minimize confusion as much as possible, variables should always be declared before they are used.

## Noncompliant Code Example

```typescript
var x = 1;

function fun() {
  alert(x); // Noncompliant as x is declared later in the same scope
  if (something) {
    var x = 42; // Declaration in function scope (not block scope!) shadows global variable
  }
}

fun(); // Unexpectedly alerts "undefined" instead of "1"
```

## Compliant Solution

```typescript
var x = 1;

function fun() {
  print(x);
  if (something) {
    x = 42;
  }
}

fun(); // Print "1"
```
