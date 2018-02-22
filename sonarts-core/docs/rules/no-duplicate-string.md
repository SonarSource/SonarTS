# no-duplicate-string

Duplicated string literals make the process of refactoring error-prone, since you must be sure to update all occurrences.

On the other hand, constants can be referenced from many places, but only need to be updated in a single place.

## Exceptions

To prevent generating some false-positives, literals having less than 10 characters are excluded as well as literals matching `/^\w*$/`.

## Configuration

Number of times a literal must be duplicated to trigger an issue can be provided. Default is 3.
```json
"no-duplicate-string": true
"no-duplicate-string": [true, 5]
```
