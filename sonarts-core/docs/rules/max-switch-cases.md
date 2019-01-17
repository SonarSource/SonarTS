# max-switch-cases

When `switch` statements have large sets of `case` clauses, it is usually an attempt to map two sets of data. A real map
structure would be more readable and maintainable, and should be used instead.

## Configuration
The maximum authorized number of `case` can be provided. Default is 30.
```json
"max-switch-cases": true
"max-switch-cases": [true, 20]
```
