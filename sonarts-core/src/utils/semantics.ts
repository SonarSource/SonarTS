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
import * as ts from "typescript";

export function isArray(node: ts.Node, typeChecker: ts.TypeChecker): boolean {
  const type = typeChecker.getTypeAtLocation(node);
  return !!type.symbol && type.symbol.name === "Array";
}

export function isNullType(type: ts.Type) {
  return Boolean(type.flags & ts.TypeFlags.Null);
}

export function isUndefinedType(type: ts.Type) {
  return Boolean(type.flags & ts.TypeFlags.Undefined);
}

export function isVoidType(type: ts.Type) {
  return Boolean(type.flags & ts.TypeFlags.Void);
}

export const ARRAY_MUTATING_CALLS = ["reverse", "sort"];
