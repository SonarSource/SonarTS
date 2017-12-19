# no-useless-cast

The TypeScript compiler automatically casts a variable to the relevant type inside conditionals where it is possible to infer (usage of `typeof`, `instanceof` etc). This compiler feature makes casts and not-null assertions unnecessary.


## Noncompliant Code Example

```typescript
function getName(x?: string | UserName) {
  if (x) {
    console.log("Getting name for " + x!); // Noncompliant

    if (typeof x === "string") 
      return (x as string); // Noncompliant
    else
      return (x as UserName).name; // Noncompliant
  }
  return "NoName";
}
```

## Compliant Solution

```typescript
function getName(x?: string | UserName) {
  if (x) {
    console.log("Getting name for " + x);

    if (typeof x === "string") 
      return x;
    else
      return x.name;
  }
  return "NoName";
}
```
