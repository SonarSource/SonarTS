# parameters-max-number

A long parameter list can indicate that a new structure should be created to wrap the numerous parameters or that the function is doing too many
things.

## Noncompliant Code Example

With a maximum number of 4 parameters:

```typescript
function doSomething(param1: number, param2: number, param3: number, param4: number, param5: number) {
...
}
```
## Compliant Solution

```typescript
function doSomething(param1: number, param2: number, param3: number, param4: number) {
...
}
```

## Configuration
Optional configuration can be provided: maximum authorized number of parameters. By default 7.
```
"parameters-max-number": [true, 10]
```
