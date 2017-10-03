/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Host, Input, OnDestroy, Optional, Provider, Renderer, forwardRef, ɵlooseIdentical as looseIdentical} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const SELECT_MULTIPLE_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectMultipleControlValueAccessor),
  multi: true
};

function _buildValueString(id: string, value: any): string {
  if (id == null) return `${value}`;
  if (typeof value === 'string') value = `'${value}'`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}

function _extractId(valueString: string): string {
  return valueString.split(':')[0];
}

/** Mock interface for HTML Options */
interface HTMLOption {
  value: string;
  selected: boolean;
}

/** Mock interface for HTMLCollection */
abstract class HTMLCollection {
  length: number;
  abstract item(_: number): HTMLOption;
}

/**
 * The accessor for writing a value and listening to changes on a select element.
 *
 *  ### Caveat: Options selection
 *
 * Angular uses object identity to select options. It's possible for the identities of items
 * to change while the data does not. This can happen, for example, if the items are produced
 * from an RPC to the server, and that RPC is re-run. Even if the data hasn't changed, the
 * second response will produce objects with different identities.
 *
 * To customize the default option comparison algorithm, `<select multiple>` supports `compareWith`
 * input. `compareWith` takes a **function** which has two arguments: `option1` and `option2`.
 * If `compareWith` is given, Angular selects options by the return value of the function.
 *
 * #### Syntax
 *
 * ```
 * <select multiple [compareWith]="compareFn"  [(ngModel)]="selectedCountries">
 *     <option *ngFor="let country of countries" [ngValue]="country">
 *         {{country.name}}
 *     </option>
 * </select>
 *
 * compareFn(c1: Country, c2: Country): boolean {
 *     return c1 && c2 ? c1.id === c2.id : c1 === c2;
 * }
 * ```
 *
 * @stable
 */
@Directive({
  selector:
      'select[multiple][formControlName],select[multiple][formControl],select[multiple][ngModel]',
  host: {'(change)': 'onChange($event.target)', '(blur)': 'onTouched()'},
  providers: [SELECT_MULTIPLE_VALUE_ACCESSOR]
})
export class SelectMultipleControlValueAccessor implements ControlValueAccessor {
  value: any;
  /** @internal */
  _optionMap: Map<string, NgSelectMultipleOption> = new Map<string, NgSelectMultipleOption>();
  /** @internal */
  _idCounter: number = 0;

  onChange = (_: any) => {};
  onTouched = () => {};

  @Input()
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      throw new Error(`compareWith must be a function, but received ${JSON.stringify(fn)}`);
    }
    this._compareWith = fn;
  }

  private _compareWith: (o1: any, o2: any) => boolean = looseIdentical;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void {
    this.value = value;
    let optionSelectedStateSetter: (opt: NgSelectMultipleOption, o: any) => void;
    if (Array.isArray(value)) {
      // convert values to ids
      const ids = value.map((v) => this._getOptionId(v));
      optionSelectedStateSetter = (opt, o) => { opt._setSelected(ids.indexOf(o.toString()) > -1); };
    } else {
      optionSelectedStateSetter = (opt, o) => { opt._setSelected(false); };
    }
    this._optionMap.forEach(optionSelectedStateSetter);
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = (_: any) => {
      const selected: Array<any> = [];
      if (_.hasOwnProperty('selectedOptions')) {
        const options: HTMLCollection = _.selectedOptions;
        for (let i = 0; i < options.length; i++) {
          const opt: any = options.item(i);
          const val: any = this._getOptionValue(opt.value);
          selected.push(val);
        }
      }
      // Degrade on IE
      else {
        const options: HTMLCollection = <HTMLCollection>_.options;
        for (let i = 0; i < options.length; i++) {
          const opt: HTMLOption = options.item(i);
          if (opt.selected) {
            const val: any = this._getOptionValue(opt.value);
            selected.push(val);
          }
        }
      }
      this.value = selected;
      fn(selected);
    };
  }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  /** @internal */
  _registerOption(value: NgSelectMultipleOption): string {
    const id: string = (this._idCounter++).toString();
    this._optionMap.set(id, value);
    return id;
  }

  /** @internal */
  _getOptionId(value: any): string|null {
    for (const id of Array.from(this._optionMap.keys())) {
      if (this._compareWith(this._optionMap.get(id) !._value, value)) return id;
    }
    return null;
  }

  /** @internal */
  _getOptionValue(valueString: string): any {
    const id: string = _extractId(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id) !._value : valueString;
  }
}

/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select multiple name="city" ngModel>
 *   <option *ngFor="let c of cities" [value]="c"></option>
 * </select>
 * ```
 */
@Directive({selector: 'option'})
export class NgSelectMultipleOption implements OnDestroy {
  id: string;
  /** @internal */
  _value: any;

  constructor(
      private _element: ElementRef, private _renderer: Renderer,
      @Optional() @Host() private _select: SelectMultipleControlValueAccessor) {
    if (this._select) {
      this.id = this._select._registerOption(this);
    }
  }

  @Input('ngValue')
  set ngValue(value: any) {
    if (this._select == null) return;
    this._value = value;
    this._setElementValue(_buildValueString(this.id, value));
    this._select.writeValue(this._select.value);
  }

  @Input('value')
  set value(value: any) {
    if (this._select) {
      this._value = value;
      this._setElementValue(_buildValueString(this.id, value));
      this._select.writeValue(this._select.value);
    } else {
      this._setElementValue(value);
    }
  }

  /** @internal */
  _setElementValue(value: string): void {
    this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
  }

  /** @internal */
  _setSelected(selected: boolean) {
    this._renderer.setElementProperty(this._element.nativeElement, 'selected', selected);
  }

  ngOnDestroy(): void {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}
