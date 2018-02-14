/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
export enum SymbolicValueType {
  Unknown,
  NumericLiteral,
  Undefined,
  ObjectLiteral,
}

export interface SymbolicValue {
  readonly type: SymbolicValueType;
}

export interface NumericLiteralSymbolicValue extends SymbolicValue {
  readonly type: SymbolicValueType.NumericLiteral;
  readonly value: string;
}

export interface UnknownSymbolicValue extends SymbolicValue {
  readonly type: SymbolicValueType.Unknown;
}

export interface UndefinedSymbolicValue extends SymbolicValue {
  readonly type: SymbolicValueType.Undefined;
}

export interface ObjectLiteralSymbolicValue extends SymbolicValue {
  readonly type: SymbolicValueType.ObjectLiteral;
}

export function numericLiteralSymbolicValue(value: string): NumericLiteralSymbolicValue {
  return { type: SymbolicValueType.NumericLiteral, value };
}

export function simpleSymbolicValue(): UnknownSymbolicValue {
  return { type: SymbolicValueType.Unknown };
}

export function undefinedSymbolicValue(): UndefinedSymbolicValue {
  return { type: SymbolicValueType.Undefined };
}

export function objectLiteralSymbolicValue(): ObjectLiteralSymbolicValue {
  return { type: SymbolicValueType.ObjectLiteral };
}

export function isEqualSymbolicValues(a: SymbolicValue, b: SymbolicValue) {
  return isNumericLiteralSymbolicValue(a) && isNumericLiteralSymbolicValue(b) ? a.value === b.value : a.type === b.type;
}

export function isNumericLiteralSymbolicValue(value: SymbolicValue): value is NumericLiteralSymbolicValue {
  return value.type === SymbolicValueType.NumericLiteral;
}

export function isUndefinedSymbolcValue(value: SymbolicValue): value is UndefinedSymbolicValue {
  return value.type === SymbolicValueType.Undefined;
}
