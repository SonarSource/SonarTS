// tslint:disable

class OK {
  private x: string;
  private _y = "hello";

  constructor(private z: number) {
    
  }

  public getX(): string {
    return this.x;
  }

  public get y(): string {
    return this._y;
  }

  public set y(y: string) {
    this._y = y;
  }

  public getY(): string {
    return this._y;
  }

  public getZ() {
    return this.z;
  }

  public setX(x: string) {
    this.x = x;
  }

}

class NOK {
  private x: string;
  private _y = "hello";
  private z = 0;

  constructor(private w: number, readonly ro: number) {
    
  }

  public setX(x: number) {
//       ^^^^  {{Refactor this setter so that it actually refers to the property 'x'}}
  }

  public GetX(): string {
//       ^^^^  {{Refactor this getter so that it actually refers to the property 'x'}}
    return this._y;
  }

  public get y(): number {
//           ^  {{Refactor this getter so that it actually refers to the property '_y'}}
    return this.z;
  }

  public set y(y: number) {
//           ^  {{Refactor this setter so that it actually refers to the property '_y'}}
  }

  public getY(): number {
//       ^^^^  {{Refactor this getter so that it actually refers to the property '_y'}}
    return this.z;
  }

  public SetZ(z: string) {
//       ^^^^  {{Refactor this setter so that it actually refers to the property 'z'}}
    this.x = z;
  }

  public setW(x: string) {
//       ^^^^  {{Refactor this setter so that it actually refers to the property 'w'}}
    this.x = x;
  }

  public setRO(ro: number) {
//       ^^^^^  {{Refactor this setter so that it actually refers to the property 'ro'}}
    this.z = ro;
  }

}

const nokObj = {
  x : 3,
  _y : 1,

  get y() {
//    ^  {{Refactor this getter so that it actually refers to the property '_y'}}
    return this.x;
  },

  setX(x: number) {
//^^^^  {{Refactor this setter so that it actually refers to the property 'x'}}
    this._y = x;
  }

}

class Exceptions {
  private x: string;
  private y = "hello";

  constructor(private z: number, private _v: number) {
    
  }

  public getW(): string { // Compliant, w does not exist
    return this.x;
  }

  private GetY(): number { // Compliant, private method
    return this.z;
  }

  public setW(w: string) { // Compliant, w does not exist
    this.x = w;
  }

  public getY(someParam: number) { // Compliant, not a zero-parameters getter
    return 3;
  }

  public setZ(y: string, someParam: number) { // Compliant, not a one-parameters setter
    this.z = 3;
  }

  public setY(x: string) // Compliant, overload
  public setY(y: string) {
    this.y = y;
  }

  public getZ() { // Compliant, does not match "return this.?;" pattern
    this.setZ("",1);
  }

  public set v(z:number) { // Compliant, does not match "this.? =" pattern
    this.x;
  }

  public get v() { // Compliant, not a single return statement
    if (this.z) {
      return 1;
    } else {
      return this.z;
    }
  }

  public getV() { // Compliant, not a single return statement
    return `v is ${this.z}`;
  }
}
