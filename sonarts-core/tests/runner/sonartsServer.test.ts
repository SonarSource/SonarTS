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
import { SonarTsServer } from "../../src/runner/sonartsServer";
import * as net from "net";
import * as path from "path";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

let client: net.Socket;
let sonartsServer: SonarTsServer;

beforeEach(async () => {
  sonartsServer = new SonarTsServer();
  client = await getClient();
});

afterEach(() => {
  client.end();
});

it("run analysis on provided content", async () => {
  let response = await sendRequest(client, {
    content: `if(x && x) console.log("identical expressions"); if (x == null) {} else if (x == 2) {}`,
  });
  expect(getRules(response.issues)).toEqual(["no-identical-expressions", "triple-equals"]);

  response = await sendRequest(client, { content: `if(x && x) console.log("identical expressions");` });
  expect(getRules(response.issues)).toEqual(["no-identical-expressions"]);
});

it("creates type-checker-based issue", async () => {
  let response = await sendRequest(client, { content: `function foo(x: number) { x as number; }` });
  expect(getRules(response.issues)).toEqual(["no-useless-cast"]);
});

it("creates cross-file type-checker-based issue", async () => {
  let response = await sendRequest(client, {
    content: `import { bar } from "./file2"; function foo() { const x = bar();}`,
  });
  expect(getRules(response.issues)).toEqual(["no-use-of-empty-return-value"]);
});

it("is able to process partial request", async () => {
  const response = await sendRequest(client, { content: "console.log('hello');".repeat(10000) });
  expect(getRules(response.issues)).toEqual([]);
});

it("reports syntax error", async () => {
  let response = await sendRequest(client, { content: `function foo() { const x = ` });
  expect(response.diagnostics).toEqual([
    { col: 26, line: 1, message: "Expression expected." },
    { col: 27, line: 1, message: "'}' expected." },
  ]);
});

it("handles custom tsconfig", async () => {
  let response = await sendRequest(client, {
    tsconfigPath: path.join(__dirname, "fixtures/custom-tsconfig-project/config/tsconfig.json"),
    content: `if(x && x) console.log("identical expressions");`,
    file: path.join(__dirname, "fixtures/custom-tsconfig-project/foo.ts"),
  });
  expect(getRules(response.issues)).toEqual(["no-identical-expressions"]);
});

function getRules(issues: any[]) {
  return issues.map(issue => issue.ruleName);
}

function getClient(): Promise<net.Socket> {
  return new Promise(resolve => {
    const server = net
      .createServer(client => {
        resolve(client);
        client.on("end", () => {
          server.close();
        });
      })
      .listen(0, "localhost", () => {
        sonartsServer.start(server.address().port);
      });
  });
}

function sendRequest(client: net.Socket, request: any): Promise<any> {
  return new Promise(resolve => {
    let dataAggregated = "";
    const listener = (data: any) => {
      try {
        dataAggregated += data;
        const response = JSON.parse(dataAggregated);
        client.removeListener("data", listener);
        resolve(response);
      } catch (e) {
        // ignore
      }
    };
    client.on("data", listener);
    client.write(requestBuilder(request));
  });
}

function requestBuilder(request: any): string {
  let defaultRequest = {
    file: path.join(__dirname, "fixtures/incremental-compilation-project/file1.ts"),
    rules: [
      { ruleName: "no-identical-expressions", ruleArguments: [] },
      { ruleName: "triple-equals", ruleArguments: ["allow-null-check"] },
      { ruleName: "no-useless-cast", ruleArguments: [] },
      { ruleName: "no-use-of-empty-return-value", ruleArguments: [] },
    ],
  };
  return JSON.stringify(Object.assign(defaultRequest, request));
}
