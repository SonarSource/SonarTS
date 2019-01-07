# prefer-base-type

For maximum reusability, functions should accept parameters with as little specialization as possible. So unless specific features from a child
class are required by a function, a type higher up the class hierarchy should be used instead.

## Noncompliant Code Example

```typescript
class Vehicle {
  go() {  /* ... */ }
}
class Submarine extends Vehicle {
  submerge(depth: number) { /* ... */ }
}

// ...
function travel(transport: Submarine) { // Noncompliant; no class-specific features used
  transport.go();
}

function exploreDepths(transport: Submarine) { // Compliant; class-specific feature used
  let depth = 0;
  // ...
  transport.submerge(depth);
}
```
## Compliant Solution

```typescript
class Vehicle {
  go() {  /* ... */ }
}
class Submarine extends Vehicle {
  submerge(depth: number) { /* ... */ }
}

// ...
function travel(transport: Vehicle) {
  transport.go();
}

function exploreDepths(transport: Submarine) {
  let depth = 0;
  // ...
  transport.submerge(depth);
}
```

