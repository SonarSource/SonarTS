# max-union-size

Union types represent a value that can be one of the several types. When a union type is used for a function parameter and it is accepting too many
types, it may indicate the function is having too many responsibilities. Sometimes it's worth creating a type alias for this union type. In all cases,
the code should be reviewed and refactored to make it more maintainable.

## Noncompliant Code Example

With the default threshold of 3:

```typescript
let x: MyType1 | MyType2 | MyType3 | MyType4; // Noncompliant

function foo(p1: string, p2: MyType1 | MyType2 | MyType3 | MyType4) { // Noncompliant
    // ...
}
```
## Compliant Solution

```typescript
type MyUnionType = MyType1 | MyType2 | MyType3 | MyType4; // Compliant, "type" statements are ignored
let x: MyUnionType;

function foo(value: string, padding: MyUnionType) {
    // ...
}
```
## Exceptions

This rule ignores union types part of `type` statement:

```typescript
type MyUnionType = MyType1 | MyType2 | MyType3 | MyType4;
```

## Configuration
The maximum number of elements can be provided. Default is 3.
```json
"max-union-size": true
"max-union-size": [true, 7]
```
