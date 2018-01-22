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
import * as fs from "fs";
import * as ts from "typescript";
import * as tslint from "tslint";
import { getIssues } from "./rules";
import { FileCache, createService } from "./languageService";
import { parseTsConfig } from "../utils/parser";

const fileCache = new FileCache();
// key is ts file path, value is corresponding tsconfig path
const tsConfigCache: Map<string, string> = new Map();
const servicesPerTsconfig: Map<string, ts.LanguageService> = new Map();

const EMPTY_ANSWER: { issues: any[] } = { issues: [] };

export function start(port: number) {
  const client = net.createConnection(port, "localhost", () => {
    console.log("sonartsServer connected to " + port);
    let accumulatedData = "";
    client.on("data", data => {
      accumulatedData += data;
      try {
        const request = JSON.parse(accumulatedData.toString());
        accumulatedData = "";
        const issues = handleAnalysisRequest(request);
        client.write(JSON.stringify(issues));
      } catch (e) {
        // ignore
      }
    });
  });
}

function handleAnalysisRequest(request: AnalysisRequest): any {
  const { file, rules, content } = request;

  fileCache.newContent({ file, content });

  let tsConfig;
  if (tsConfigCache.has(file)) {
    tsConfig = tsConfigCache.get(file)!;
  } else {
    tsConfig = getTsConfig(file);
    if (tsConfig) {
      tsConfigCache.set(file, tsConfig);
    } else {
      console.error("No tsconfig.json file found for " + file);
      return EMPTY_ANSWER;
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
    return EMPTY_ANSWER;
  }
  return getIssues(rules, program, sourceFile);
}

function getTsConfig(filePath: string): string | undefined {
  let currentDirectory = filePath;
  do {
    currentDirectory = path.dirname(currentDirectory);
    const possibleTsConfig = path.join(currentDirectory, "tsconfig.json");

    if (fs.existsSync(possibleTsConfig)) {
      return possibleTsConfig;
    }
  } while (currentDirectory !== path.dirname(currentDirectory));

  return undefined;
}

interface AnalysisRequest {
  file: string;
  rules: tslint.IOptions[];
  content: string;
}
