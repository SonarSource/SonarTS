# no-duplicate-in-composite

TypeScript type system offers a basic support for composite types (also known as algebraic data types):

- Union Types represent a value that can be of several types. They are constructed using a vertical bar (`|`) like the
following `type foo = number | string`. Union types, and their extension Discriminated Unions, are frequently used in a Redux
architecture.

- Intersection Types combine multiple values into one. They are constructed using an ampersand (`&amp;`) like the following
`type bar = Person &amp; Serializable`. Intersection Types are often used to represent mixins.

Even if they have no side effect at runtime, duplicating types when defining a "union" or "interaction" type makes the code less readable. Moreover
duplicated type might be a simple mistake and another type should be used instead.

## Noncompliant Code Example

```typescript
let x: number | number | string; // Noncompliant

function padLeft(value: string, padding: string | number | string) { // Noncompliant; string is duplicated twice
  // ...
}

function extend(p : Person) : Person &amp; Person &amp; Loggable { // Noncompliant; Person is duplicated twice
 // ...
}
```
## Compliant Solution

```typescript
let x: number | string;

function padLeft(value: string, padding: string | number | boolean) {
  // ...
}

function extend(p : Person) : Person &amp; Loggable {
  // ...
}
```

