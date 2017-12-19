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
import { start } from "../../src/runner/sonarts-server";
import * as net from "net";
import * as path from "path";

it("run analysis on provided content", done => {
  const port = start();
  var client = new net.Socket();
  client.connect(port, "localhost", function() {
    console.log("Connected");
    client.write(
      JSON.stringify({
        operation: "analyze",
        file: path.join(__dirname, "fixtures/incremental-compilation-project/file1.ts"),
        content: `if(x && x) console.log("identical expressions");`,
      }),
    );
  });

  client.on("data", function(data) {
    const response = JSON.parse(data.toString());
    client.destroy();
    expect(response.issues.length).toBe(1);
    done();
  });
});
