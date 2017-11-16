# no-element-overwrite

It is highly suspicious when a value is saved for a key or index and then unconditionally 
overwritten. Such replacements are likely in error.

This rule will check if array index, key in the Map, element in the Set or object property is overwritten without being 
used in consecutive sequence of assignment statements.

## Noncompliant Code Example

```typescript
function fun() {
  const fruits = [];
  fruits[1] = "banana";
  fruits[1] = "apple";  // Noncompliant - value on index 1 is overwritten
  return fruits;
}

function map() {
  const myMap = new Map<string, number>();
  myMap.set("first", 1);
  myMap.set("first", 2); // Noncompliant - value for key "key" is replaced
  return map;
}
```

## Compliant Solution

```typescript
function arr() {
  const fruits = [];
  fruits[1] = "banana";
  fruits[2] = "apple";
}

function map() {
  const myMap = new Map<string, number>();
  myMap.set("first", 1);
  myMap.set("second", 2); // Noncompliant - value for key "key" is replaced
  return map;
}
```

