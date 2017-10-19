# no-identical-functions

When two functions have the same implementation, either it was a mistake - something else was intended - or the duplication was intentional, but
may be confusing to maintainers. In the latter case, the code should be refactored.</p>

## Noncompliant Code Example
```typescript
class MyClass {
  private readonly CODE = "bounteous";

  public calculateCode(): string {
    doTheThing();
    doOtherThing();
    return this.CODE;
  }

  public getName(): string {  // Noncompliant
    doTheThing();
    doOtherThing();
    return this.CODE;
  }
}
```

## Compliant Solution
```typescript
class MyClass {
  private readonly CODE = "bounteous";

  public calculateCode(): string {
    doTheThing();
    doOtherThing();
    return this.CODE;
  }

  public getName(): string {
    return this.calculateCode();
  }
}
```

## Exceptions

Functions with fewer than 3 lines are ignored.
