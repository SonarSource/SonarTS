# use-primitive-type

The use of wrapper objects for primitive types is gratuitous, confusing and dangerous. If you use a wrapper object constructor for type conversion, just remove the `new` keyword, and you'll get a primitive value automatically. If you use a wrapper object as a way to add properties to a primitive, you should re-think the design. Such uses are considered bad practice, and should be refactored. Finally, this rule reports usages of wrapper objects in type declaration section.

## Noncompliant Code Example
```typescript
let x = new Number("0"); // Noncompliant
if (x) {
  alert('hi');  // Shows 'hi'.
}

function log(msg: String) { // Noncompliant
  console.log(msg);
}
```

## Compliant Solution
```typescript
let x = Number("0");
if (x) {
  alert('hi');
}

function log(msg: string) {
  console.log(msg);
}
```
