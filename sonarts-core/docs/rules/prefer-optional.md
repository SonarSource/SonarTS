# prefer-optional

In TypeScript there are several ways to declare an optional property, i.e. a property which might be missing from an object: adding `|
undefined` in the property type or adding `?` after its name. The latter is preferred as it brings more clarity and readability to a
code.

## Noncompliant Code Example

```typescript
interface Person {
  name: string;
  nickname: string | undefined; // Noncompliant
  age: number;
}
```
## Compliant Solution

```typescript
interface Person {
  name: string;
  nickname?: string;
  age: number;
}
```

