# consecutive-overloads

For clarity, all overloads of the same method should be grouped together. That lets both users and maintainers quickly understand all the current
available options.

## Noncompliant Code Example

```typescript
interface MyInterface {
  doTheThing(): number;
  doTheOtherThing(): string;
  doTheThing(str: string): string;  // Noncompliant
}
```
## Compliant Solution

```typescript
interface MyInterface {
  doTheThing(): number;
  doTheThing(str: string): string;
  doTheOtherThing(): string;
}
```

