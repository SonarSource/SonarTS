# no-duplicate-in-composite

The TypeScript type system offers a basic support for composite types:

- Union Types represent a value that can be one of the several types. They are constructed using a vertical bar (`|`) like the following `type NumberOrString = number | string`.

- Intersection Types combine multiple types into one, so that the object of such type will have all the members of all intersection type elements. They are constructed using an ampersand (`&`) like the following `type SerializablePerson = Person & Serializable`. Intersection Types are often used to represent mixins.

Duplicating types when defining a union or interaction type makes the code less readable. Moreover duplicated types might be a simple mistake and another type should be used instead.

## Noncompliant Code Example

```typescript
function padLeft(value: string, padding: string | number | string) { // Noncompliant; 'string' type is used twice in a union type declaration
  // ...
}

function extend(p : Person) : Person & Person & Loggable { // Noncompliant; 'Person' is used twice
 // ...
}
```
## Compliant Solution

```typescript
function padLeft(value: string, padding: string | number | boolean) {
  // ...
}

function extend(p : Person) : Person & Loggable {
  // ...
}
```

