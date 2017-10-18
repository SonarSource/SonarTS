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
    return 1;
  }

  public set y(y: number) {
//           ^  {{Refactor this setter so that it actually refers to the property '_y'}}
  }

  public getY(): number {
//       ^^^^  {{Refactor this getter so that it actually refers to the property '_y'}}
    return 1;
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

class Exceptions {
  private x: string;
  private y = "hello";

  constructor(private z: number) {
    
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
}


export class FilterOptions {
  
    private _filterErrors: boolean = false;
    private _filterWarnings: boolean = false;
    private _filterInfos: boolean = false;
    private _filter: string = '';
    private _completeFilter: string = '';
  
    constructor(filter: string = '') {
      if (filter) {
        this.parse(filter);
      }
    }
  
    public get filterErrors(): boolean {
      return this._filterErrors;
    }
  
    public get filterWarnings(): boolean {
      return this._filterWarnings;
    }
  
    public get filterInfos(): boolean {
      return this._filterInfos;
    }
  
    public get filter(): string {
      return this._filter;
    }
  
    public get completeFilter(): string {
      return this._completeFilter;
    }
  
    public hasFilters(): boolean {
      return !!this._filter;
    }
  
    private parse(filter: string) {
      this._completeFilter = filter;
      this._filter = filter.trim();
      this._filterErrors = this.matches(this._filter, "Messages.MARKERS_PANEL_FILTER_ERRORS");
      this._filterWarnings = this.matches(this._filter, "Messages.MARKERS_PANEL_FILTER_WARNINGS");
      this._filterInfos = this.matches(this._filter, "Messages.MARKERS_PANEL_FILTER_INFOS");
    }
  
    private matches(prefix: string, word: string): boolean {
      let result = "";
      return result && result.length > 0;
    }
  }
  
