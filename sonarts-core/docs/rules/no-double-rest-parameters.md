# no-double-rest-parameters

When rest parameter is passed as rest argument to another function call without using spread, this rest parameter will be wrapped in one more
array, which is probably is not what intended.

## Noncompliant Code Example

```typescript
collect(new Book(), new Book());

function collect(...books: Book[]) {
  buy(books);   // Noncompliant
}

function buy(...things: any[]) {
  console.log(things); // outputs "[ [ Book {}, Book {} ] ]"
}
```
## Compliant Solution

```typescript
collect(new Book(), new Book());

function collect(...books: Book[]) {
  buy(...books);
}

function buy(...things: any[]) {
  console.log(things); // outputs "[ Book {}, Book {} ]"
}
```

