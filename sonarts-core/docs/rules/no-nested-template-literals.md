# no-nested-template-literals

Template literals (previously named "template strings") are an elegant way to build a string without using the "+" operator to make strings
concatenation more readable. However, it's possible to build complex string literals by nesting together multiple template literals, and therefore lose in readability and maintainability.
In such situation, it's preferred to move the nested template in a separate statement.

## Noncompliant Code Example

```typescript
let color = "red";
let count = 3;
let message = `I have ${color ? `${count} ${color}` : count} apples`; // Noncompliant; nested template strings not easy to read
```
## Compliant Solution

```typescript
let color = "red";
let count = 3;
let apples = color ? `${count} ${color}` : count;
let message = `I have ${apples} apples`;
```

