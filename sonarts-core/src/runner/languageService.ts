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
import * as fs from "fs";
import * as ts from "typescript";

export function createService(
  rootFileNames: string[],
  options: ts.CompilerOptions,
  cache: FileCache,
): ts.LanguageService {
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName => cache.version(fileName),
    getScriptSnapshot: fileName => {
      const cached = cache.retrieveContent(fileName);
      if (cached) {
        return ts.ScriptSnapshot.fromString(cached);
      }

      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  };

  return ts.createLanguageService(servicesHost);
}

export class FileCache {
  private files: Map<string, VersionedContent> = new Map();

  newContent(update: { file: string; content: string }): void {
    const previous = this.files.get(update.file);
    let version = 0;
    if (previous) {
      version = previous.version + 1;
    }
    this.files.set(update.file, { content: update.content, version });
  }

  version(file: string) {
    return this.files.has(file) ? this.files.get(file)!.version.toString() : "n/a";
  }

  retrieveContent(file: string): string | undefined {
    return this.files.has(file) ? this.files.get(file)!.content : undefined;
  }
}

interface VersionedContent {
  content: string;
  version: number;
}
