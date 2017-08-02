# no-empty-nested-blocks

Most of the time a block of code is empty when a piece of code is really missing. So such empty block must be either 
filled or removed.

##  Noncompliant Code Example

```typescript
for (let i = 0; i < 42; i++) {}  // Empty on purpose or missing piece of code ?
```

## Exceptions

When a block contains a comment, this block is not considered to be empty. Moreover `catch` blocks are ignored.
