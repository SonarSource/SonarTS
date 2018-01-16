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
import { start } from "../../src/runner/sonartsServer";
import * as net from "net";
import * as path from "path";

let server: net.Server, port: number, client: net.Socket;

beforeEach(async () => {
  ({ server, port } = await start(55556));
  client = await getClient();
});

afterEach(done => {
  client.end();
  server.close(done);
});

it("run analysis on provided content", async () => {
  let response = await sendRequest(
    client,
    `if(x && x) console.log("identical expressions"); if (x == null) {} else if (x == 2) {}`,
  );
  expect(getRules(response.issues)).toEqual(["no-identical-expressions", "triple-equals"]);

  response = await sendRequest(client, `if(x && x) console.log("identical expressions");`);
  expect(getRules(response.issues)).toEqual(["no-identical-expressions"]);
});

it("creates type-checker-based issue", async () => {
  let response = await sendRequest(client, `function foo(x: number) { x as number; }`);
  expect(getRules(response.issues)).toEqual(["no-useless-cast"]);
});

it("creates cross-file type-checker-based issue", async () => {
  let response = await sendRequest(client, `import { bar } from "./file2"; function foo() { const x = bar();}`);
  expect(getRules(response.issues)).toEqual(["no-use-of-empty-return-value"]);
});

function getRules(issues: any[]) {
  return issues.map(issue => issue.ruleName);
}

function getClient(): Promise<net.Socket> {
  return new Promise(resolve => {
    const client = net.connect(port, "localhost", () => resolve(client));
  });
}

function sendRequest(client: net.Socket, content: string): Promise<any> {
  return new Promise(resolve => {
    write(client, content);
    let dataAggregated = "";

    const listener = (data: any) => {
      dataAggregated += data;
      try {
        const response = JSON.parse(dataAggregated);
        client.removeListener("data", listener);
        resolve(response);
      } finally {
      }
    };
    client.on("data", listener);
  });
}

function write(client: net.Socket, content: string) {
  client.write(
    JSON.stringify({
      file: path.join(__dirname, "fixtures/incremental-compilation-project/file1.ts"),
      content,
      rules: [
        {
          ruleName: "no-identical-expressions",
          ruleArguments: [],
        },
        {
          ruleName: "triple-equals",
          ruleArguments: ["allow-null-check"],
        },
        {
          ruleName: "no-useless-cast",
          ruleArguments: [],
        },
        {
          ruleName: "no-use-of-empty-return-value",
          ruleArguments: [],
        },
      ],
    }),
  );
}
