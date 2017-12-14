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
import * as net from "net";

export function start(rootFileNames: string[]): number {
  const holder = { file: "hello", content: "" };
  const service = createService(rootFileNames, {}, holder);
  const server = net.createServer(socket => {
    socket.on("data", data => {
      const update = JSON.parse(data.toString());
      holder.file = update.file;
      holder.content = update.content;
      socket.write(
        service
          .getProgram()
          .getSourceFile(update.file)
          .getFullText(),
      );
      socket.write(
        "\n" + JSON.stringify(service.getSemanticDiagnostics(update.file).map(diagnostic => diagnostic.messageText)),
      );
    });
  });
  const port = 55555;
  server.listen(port, "localhost");
  return port;
}

function createService(
  rootFileNames: string[],
  options: ts.CompilerOptions,
  holder: { file: string; content: string },
): ts.LanguageService {
  const files: ts.MapLike<{ version: number }> = {};

  // initialize the list of files
  rootFileNames.forEach(fileName => {
    files[fileName] = { version: 0 };
  });

  // Create the language service host to allow the LS to communicate with the host
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: fileName => {
      if (holder.file == fileName) {
        return ts.ScriptSnapshot.fromString(holder.content);
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
