/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getIntParameter} from '../util';

export class TableCell {
  constructor(public row: number, public col: number, public value: string) {}
}

let tableCreateCount: number;
export let maxRow: number;
export let maxCol: number;
let numberData: TableCell[][];
let charData: TableCell[][];

init();

function init() {
  maxRow = getIntParameter('rows');
  maxCol = getIntParameter('cols');
  tableCreateCount = 0;
  numberData = [];
  charData = [];
  for (let r = 0; r <= maxRow; r++) {
    const numberRow: TableCell[] = [];
    numberData.push(numberRow);
    const charRow: TableCell[] = [];
    charData.push(charRow);
    for (let c = 0; c <= maxCol; c++) {
      numberRow.push(new TableCell(r, c, `${c}/${r}`));
      charRow.push(new TableCell(r, c, `${charValue(c)}/${charValue(r)}`));
    }
  }
}

function charValue(i: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + (i % 26));
}

export const emptyTable: TableCell[][] = [];

export function buildTable(): TableCell[][] {
  tableCreateCount++;
  return tableCreateCount % 2 ? numberData : charData;
}
