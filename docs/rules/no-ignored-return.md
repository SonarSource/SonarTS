# no-ignored-return

When the call to a function doesn't have any side effects, what is the point of making the call if 
the results are ignored? In such case, either the function call is useless and should be dropped or 
the source code doesn't behave as expected.

To prevent generating any false-positives, this rule triggers an issues only on a predefined list 
of known objects & functions.

## Noncompliant Code Example

```typescript
'hello'.lastIndexOf('e');
```

## Compliant Solution

```typescript
let char = 'hello'.lastIndexOf('e'); 
```