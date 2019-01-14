# no-alphabetical-sort

The default sort order is alphabetic, rather than numeric, regardless of the types in the array. Specifically, even if an array contains only
numbers, all values in it will be converted to strings and sorted lexicographically, for an order like this: 1, 15, 2, 20, 5.

Fortunately the `sort` method allows you to pass an optional compare function to specify the sort order. When a compare function is
supplied, the returned order depends on the return value of the compare function. 

## Noncompliant Code Example

```typescript
var myarray = [80, 3, 9, 34, 23, 5, 1];

myarray.sort();
console.log(myarray); // outputs: [1, 23, 3, 34, 5, 80, 9]
```
## Compliant Solution

```typescript
var myarray = [80, 3, 9, 34, 23, 5, 1];

myarray.sort(function(a, b){
    if (a &lt; b)
        return -1;
    if (a &gt; b)
        return 1;
    else
        return 0;
});
console.log(myarray); // outputs: [1, 3,  5, 9, 23, 34, 80]
```

