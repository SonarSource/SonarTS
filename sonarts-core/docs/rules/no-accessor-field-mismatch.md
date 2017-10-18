# no-accessor-field-mismatch

Getters and setters provide a way to enforce encapsulation by providing `public` methods that give controlled access to `private` fields. However in classes with multiple fields it is not unusual that cut and paste is used to quickly create the needed getters and setters, which can result in the wrong field being accessed by a getter or setter.

This rule raises an issue in any of these cases:
* A setter does not update the field with the corresponding name.
* A getter does not access the field with the corresponding name.

## Noncompliant Code Example

```typescript
class A {
  private x: number = 0;
  private y: number = 0;

  public setX(val: number) { // Noncompliant: field 'x' is not updated
    if (val >= 0 && val < 10) {
      this.y = val;
    }
  }

  public getY() { // Noncompliant: field 'y' is not used in the return value
    return this.x;
  }
}
```

## Compliant Solution

```typescript
class A {
  private x: number = 0;
  private y: number = 0;

  public setX(val: number) {
    if (val >= 0 && val < 10) {
      this.x = val;
    }
  }

  public getY() {
    return this.y;
  }
}
```
