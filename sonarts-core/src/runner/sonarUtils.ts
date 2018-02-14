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

// SonarQube's line indexing starts from 1, while TypeScript is 0 based.
export function toSonarLine(line: number) {
  return line + 1;
}

export function nodeToSonarLine(node: ts.Node) {
  return toSonarLine(node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line);
}

export function stringifyToStream(stream: NodeJS.WritableStream, data: any[]) {
  stream.write("[");

  data.forEach((element, index) => {
    stream.write("{");

    let firstProp = true;

    Object.keys(element).forEach(key => {
      const value = element[key];
      if (value !== undefined) {
        if (!firstProp) {
          stream.write(",");
        }
        stream.write(`"${key}":${JSON.stringify(value)}`);
        firstProp = false;
      }
    });

    stream.write("}");

    if (index + 1 !== data.length) {
      stream.write(",");
    }
  });

  stream.write("]");
}
