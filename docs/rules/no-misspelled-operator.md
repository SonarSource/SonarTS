# no-misspelled-operator

The use of operators pairs ( `=+`, `=-` or `=!` ) where the reversed, single operator was meant (`+=`, `-=` or `!=`) will compile and run, but not produce the expected results.
This rule raises an issue when `=+`, `=-`, or `=!` is used without any spacing between the two operators and when there is at least one whitespace character after.

## Noncompliant Code Example

```typescript
let target =-5;
let num = 3;

target =- num;  // Noncompliant; target = -3. Is that really what's meant?
target =+ num; // Noncompliant; target = 3
```

## Compliant Solution

```typescript
let target = -5;
let num = 3;

target = -num;  // Compliant; intent to assign inverse value of num is clear
target += num;
```