# no-array-delete

The `delete` operator can be used to remove a property from any object. Arrays are objects, so the `delete` operator can
be used here too, but if it is, a hole will be left in the array because the indexes/keys won't be shifted to reflect 
the deletion.

The proper method for removing an element at a certain index would be:

* `Array.prototype.splice` - add/remove elements from the array
* `Array.prototype.pop` - add/remove elements from the end of the array
* `Array.prototype.shift` - add/remove elements from the beginning of the array

## Noncompliant Code Example

```typescript
let myArray = ['a', 'b', 'c', 'd'];

delete myArray[2];  // Noncompliant. myArray => ['a', 'b', undefined, 'd']
console.log(myArray[2]); // expected value was 'd' but output is undefined
```

## Compliant Solution

```typescript
let myArray = ['a', 'b', 'c', 'd'];

// removes 1 element from index 2
let removed = myArray.splice(2, 1);  // myArray => ['a', 'b', 'd']
console.log(myArray[2]); // outputs 'd'
```
