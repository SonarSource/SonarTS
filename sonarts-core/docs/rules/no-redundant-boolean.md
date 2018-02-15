# no-redundant-boolean

Redundant Boolean literals should be removed from expressions to improve readability.

## Noncompliant Code Example

```typescript
if (booleanMethod() == true) { /* ... */ }
if (booleanMethod() == false) { /* ... */ }
if (booleanMethod() || false) { /* ... */ }
doSomething(!false);
doSomething(booleanMethod() == true);

booleanVariable = booleanMethod() ? true : false;
booleanVariable = notBooleanMethod() ? true : false;
```
## Compliant Solution

```typescript
if (booleanMethod()) { /* ... */ }
if (!booleanMethod()) { /* ... */ }
if (booleanMethod()) { /* ... */ }
doSomething(true);
doSomething(booleanMethod());

booleanVariable = booleanMethod();
booleanVariable = Boolean(notBooleanMethod());
```

