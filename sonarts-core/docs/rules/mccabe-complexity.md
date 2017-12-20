# mccabe-complexity

The Cyclomatic Complexity of functions should not exceed a defined threshold. Complex code may perform poorly and can be difficult to test thoroughly.

## Configuration
The maximum authorized complexity can be provided. Default is 10.
```json
"mccabe-complexity": true
"mccabe-complexity": [true, 20]
```