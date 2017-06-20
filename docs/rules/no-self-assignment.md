# no-self-assignment

There is no reason to re-assign a variable to itself. Either this statement is redundant and should 
be removed, or the re-assignment is a mistake and some other value or variable was intended for the 
assignment instead.

## Noncompliant Code Example

```typescript
function setName(name) {
  name = name;
}
```
