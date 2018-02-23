# no-big-function

A function that grows too large tends to aggregate too many responsibilities.

Such functions inevitably become harder to understand and therefore harder to maintain. 

Above a specific threshold, it is strongly advised to refactor into smaller functions which focus on well-defined tasks.

Those smaller functions will not only be easier to understand, but also probably easier to test.
## Configuration

Maximum authorized lines of code in a function. Default is 200.
```json
"no-big-function": true
"no-big-function": [true, 100]
```
