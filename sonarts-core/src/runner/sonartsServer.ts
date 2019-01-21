/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
import * as net from "net";
import * as path from "path";
import * as fs from "fs";
import * as ts from "typescript";
import * as tslint from "tslint";
import { getIssues } from "./rules";
import { createService, FileCache } from "./languageService";
import { parseTsConfig } from "../utils/parser";
import getDiagnostics from "./diagnostics";

const EMPTY_ANSWER: { issues: any[] } = { issues: [] };
export const DEFAULT_TSCONFIG = "DEFAULT_TSCONFIG";

export class SonarTsServer {
  readonly fileCache = new FileCache();
  // key is ts file path, value is corresponding tsconfig path
  readonly tsConfigCache: Map<string, string> = new Map();
  readonly servicesPerTsconfig: Map<string, ts.LanguageService> = new Map();

  public start(port: number) {
    logTypeScriptMetaInfo();
    const client = net.createConnection(port, "localhost", () => {
      console.log("SonarTS Server connected to " + port);
      let accumulatedData = "";
      client.on("data", data => {
        accumulatedData += data;
        try {
          const request = JSON.parse(accumulatedData.toString());
          accumulatedData = "";
          const issues = this.handleAnalysisRequest(request);
          client.write(JSON.stringify(issues));
        } catch (e) {
          // ignore
        }
      });
    });
  }

  private handleAnalysisRequest(request: AnalysisRequest): any {
    const { file, rules, content, projectRoot, tsconfigPath } = request;

    this.fileCache.newContent({ file, content });

    let tsConfig;
    if (this.tsConfigCache.has(file)) {
      tsConfig = this.tsConfigCache.get(file)!;
    } else {
      tsConfig = this.getTsConfig(file, tsconfigPath);
      if (tsConfig) {
        this.tsConfigCache.set(file, tsConfig);
      } else {
        return EMPTY_ANSWER;
      }
    }

    let service = this.servicesPerTsconfig.get(tsConfig);
    if (!service) {
      const { files, options } = parseTsConfig(tsConfig, projectRoot);
      service = createService(files, options, this.fileCache);
      this.servicesPerTsconfig.set(tsConfig, service);
    }

    const program = service.getProgram();
    if (!program) {
      console.error(`No Program found with configuration ${tsConfig}`);
      return EMPTY_ANSWER;
    }
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) {
      console.error(`No SourceFile found for file ${file} with configuration ${tsConfig}`);
      return EMPTY_ANSWER;
    }
    const diagnostics = getDiagnostics(sourceFile, program);
    if (diagnostics.length > 0) {
      return { diagnostics };
    }
    return getIssues(rules, program, sourceFile);
  }

  private getTsConfig(filePath: string, tsconfigPath?: string): string | undefined {
    if (tsconfigPath) {
      if (fs.existsSync(tsconfigPath)) {
        return tsconfigPath;
      } else {
        console.error(
          `The tsconfig file ${tsconfigPath} doesn't exist. Check property specified in sonar.typescript.tsconfigPath`,
        );
        return undefined;
      }
    }
    let currentDirectory = filePath;
    do {
      currentDirectory = path.dirname(currentDirectory);
      const possibleTsConfig = path.join(currentDirectory, "tsconfig.json");

      if (fs.existsSync(possibleTsConfig)) {
        return possibleTsConfig;
      }
    } while (currentDirectory !== path.dirname(currentDirectory));
    console.warn(`No tsconfig.json file found for ${filePath}, using default configuration`);
    return DEFAULT_TSCONFIG;
  }
}

function logTypeScriptMetaInfo() {
  const version = require("typescript/package.json").version;
  const location = path.dirname(path.dirname(require.resolve("typescript")));

  console.log(`Using typescript at [${location}], version ${version}`);
}

interface AnalysisRequest {
  file: string;
  rules: tslint.IOptions[];
  content: string;
  projectRoot: string;
  tsconfigPath?: string;
}
