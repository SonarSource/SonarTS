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
import * as net from "net";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as ts from "typescript";
import { getIssues } from "./rules";
import { FileCache, createService } from "./languageService";
import { parseTsConfig } from "../utils/parser";

export function start() {
  const fileCache = new FileCache();
  // key is ts file path, value is corresponding tsconfig path
  const tsConfigCach: Map<string, string> = new Map();
  const servicesPerTsconfig: Map<String, ts.LanguageService> = new Map();

  const server = net.createServer(socket => {
    socket.on("data", data => {
      const request = JSON.parse(data.toString());

      if (request.operation === "analyze") {
        const { file, rules, content } = request;

        fileCache.newContent({ file, content });

        let tsConfig;
        if (tsConfigCach.has(file)) {
          tsConfig = tsConfigCach.get(file)!;
        } else {
          tsConfig = getTsConfig(file);
          if (tsConfig) {
            tsConfigCach.set(file, tsConfig);
          } else {
            console.error("No tsconfig.json file found for " + file);
            socket.write("[]");
            return;
          }
        }

        let service = servicesPerTsconfig.get(tsConfig);
        if (!service) {
          const { files, options } = parseTsConfig(tsConfig);
          service = createService(files, options, fileCache);
          servicesPerTsconfig.set(tsConfig, service);
        }

        const program = service.getProgram();
        const sourceFile = program.getSourceFile(file);
        if (!sourceFile) {
          console.error(`No SourceFile found for file ${file} with configuration ${tsConfig}`);
          socket.write("[]");
          return;
        }
        const issues = getIssues(rules, program, sourceFile);
        socket.write(JSON.stringify(issues));
      } else {
        console.error("Unknown operation for SonarTS Server: " + request.operation);
        socket.write("[]");
      }
    });
  });
  const port = 55555;
  server.listen(port, "localhost");
  console.log("SonarTS Server started on port " + port + " from folder " + __dirname);
  return { server, port };
}

function getTsConfig(filePath: string): string | undefined {
  let currentDirectory = filePath;
  const fsRoot = getSystemRoot();
  do {
    currentDirectory = path.dirname(currentDirectory);
    const possibleTsConfig = path.join(currentDirectory, "tsconfig.json");

    if (fs.existsSync(possibleTsConfig)) {
      return possibleTsConfig;
    }
  } while (currentDirectory != fsRoot);

  return undefined;
}

function getSystemRoot(): string {
  return os.platform() == "win32" ? process.cwd().split(path.sep)[0] : "/";
}
