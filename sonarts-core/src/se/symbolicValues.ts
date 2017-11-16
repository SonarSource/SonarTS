/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
export interface SymbolicValue {
  type: string;
}

export interface LiteralSymbolicValue extends SymbolicValue {
  type: "literal";
  value: string;
}

export interface UnknownSymbolicValue extends SymbolicValue {
  type: "unknown";
}

export interface UndefinedSymbolicValue extends SymbolicValue {
  type: "undefined";
}

export interface ObjectLiteralSymbolicValue extends SymbolicValue {
  type: "object";
}

export function createLiteralSymbolicValue(value: string): LiteralSymbolicValue {
  return { type: "literal", value };
}

export function createUnknownSymbolicValue(): UnknownSymbolicValue {
  return { type: "unknown" };
}

export function createUndefinedSymbolicValue(): UndefinedSymbolicValue {
  return { type: "undefined" };
}

export function createObjectLiteralSymbolicValue(): ObjectLiteralSymbolicValue {
  return { type: "object" };
}

export function isEqualSymbolicValues(a: SymbolicValue, b: SymbolicValue) {
  return isLiteralSymbolicValue(a) && isLiteralSymbolicValue(b) ? a.value === b.value : a.type === b.type;
}

function isLiteralSymbolicValue(value: SymbolicValue): value is LiteralSymbolicValue {
  return value.type === "literal";
}
