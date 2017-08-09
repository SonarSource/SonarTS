# no-dead-store

A dead store happens when a local variable is assigned a value that is not read by any subsequent instruction or when an object property is assigned a value that is not subsequently used. Calculating or retrieving a value only to then overwrite it or throw it away, could indicate a serious error in the code. Even if it's not an error, it is at best a waste of resources. Therefore all calculated values should be used.

## Noncompliant Code Example

```typescript
function pow(a, b) {
  if(b == 0) {
    return 0;
  }
  var x = a;
  for(var i = 1; i < b; i++) {
    x = x * a;  //Dead store because the last return statement should return x instead of returning a
  }
  return a;
}
```

## Compliant Solution
```typescript
function pow(a, b) {
  if(b == 0) {
    return 0;
  }
  var x = a;
  for(var i = 1; i < b; i++) {
    x = x * a;
  }
  return x;
}
```

## Exceptions
This rule ignores initializations to `-1`, `0`, `1`, `null`, `true`, `false`, `""`, `[]` and `{}`.
