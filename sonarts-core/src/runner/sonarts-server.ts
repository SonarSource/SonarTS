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
import { createService, FileCache } from "./language-service";
import * as rules from "./rules";

export function start(): number {
  const server = net.createServer(socket => {
    socket.on("data", data => {
      const request = JSON.parse(data.toString());
      if (request.operation === "analyze") {
        const fileCache = new FileCache();
        fileCache.newContent(request);
        const service = createService([request.file], {}, fileCache);
        const program = service.getProgram();
        const issues = rules.getIssues(
          [
            {
              ruleName: "no-identical-expressions",
              ruleArguments: [],
              ruleSeverity: "error",
              disabledIntervals: null,
            },
          ],
          program,
          program.getSourceFile(request.file),
        );
        socket.write(JSON.stringify(issues));
      }
    });
  });
  const port = 55555;
  server.listen(port, "localhost");
  return port;
}
