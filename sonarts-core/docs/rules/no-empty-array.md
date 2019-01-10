# no-empty-array

When a collection is empty it makes no sense to access or iterate it. Doing so anyway is surely an error; either population was accidentally
omitted or the developer doesn't understand the situation.

## Noncompliant Code Example

```typescript
let strings = [];

if (strings.includes("foo")) {}  // Noncompliant

for (String str of strings) {}  // Noncompliant

strings.forEach() // Noncompliant

```

