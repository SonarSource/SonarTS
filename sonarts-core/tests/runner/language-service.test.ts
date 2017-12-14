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
import * as path from "path";
import { start } from "../../src/runner/language-service";
import * as net from "net";

it("should ping", done => {
  const port = start([
    "/home/carlobottiglieri/dev/SonarTS/sonarts-core/src/runner/incremental-compilation-project/file1.ts",
  ]);
  var client = new net.Socket();
  client.connect(port, "localhost", function() {
    console.log("Connected");
    client.write(
      JSON.stringify({
        file: "/home/carlobottiglieri/dev/SonarTS/sonarts-core/src/runner/incremental-compilation-project/file1.ts",
        content: `
        import { foo } from "./file2";
        let y:string = foo();`,
      }),
    );
  });

  client.on("data", function(data) {
    console.log("Received: " + data);
  });

  client.on("close", function() {
    console.log("Connection closed");
    client.destroy(); // kill client after server's response
    done();
  });
});
