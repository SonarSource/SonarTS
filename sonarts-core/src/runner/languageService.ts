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
      const cached = cache.retrieve(fileName);
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

  // Create the language service files
  return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
}

export class FileCache {
  private files: ts.MapLike<VersionedContent> = {};

  newContent(update: { file: string; content: string }): void {
    const previous = this.files[update.file];
    let version = 0;
    if (previous) {
      version = previous.version + 1;
    }
    this.files[update.file] = { content: update.content, version };
  }

  version(file: string) {
    return this.files[file] && this.files[file].version.toString();
  }

  retrieve(file: string): string | undefined {
    return this.files[file] && this.files[file].content;
  }
}

interface VersionedContent {
  content: string;
  version: number;
}
