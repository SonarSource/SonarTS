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
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_TSCONFIG } from "../runner/sonartsServer";

/**
 * Use for test purposes only.
 * Enables:
 * - ES2017
 * - JSX
 */
const TARGET = ts.ScriptTarget.ES2017;

export function parseString(
  source: string,
  scriptKind: ts.ScriptKind = ts.ScriptKind.TSX,
): { sourceFile: ts.SourceFile; program: ts.Program } {
  const filename = "filename.ts";
  const host: ts.CompilerHost = {
    ...ts.createCompilerHost({ strict: true }),
    getSourceFile: () => ts.createSourceFile(filename, source, TARGET, true, scriptKind),
    getCanonicalFileName: () => filename,
  };
  const program = ts.createProgram([], { strict: true }, host);
  return { sourceFile: program.getSourceFiles()[0], program };
}

export function parseStringAsSourceFile(source: string, scriptKind: ts.ScriptKind = ts.ScriptKind.TSX): ts.SourceFile {
  return ts.createSourceFile("filename.ts", source, TARGET, true, scriptKind);
}

/**
 * @throws if parsing error
 */
export function parseFile(filename: string): { sourceFile: ts.SourceFile; program: ts.Program } {
  const compilerOptions = { strict: true, target: TARGET };
  const program = ts.createProgram([filename], compilerOptions, ts.createCompilerHost(compilerOptions, true));

  const syntacticDiagnostics = program.getSyntacticDiagnostics();
  if (syntacticDiagnostics.length > 0) {
    const firstError = syntacticDiagnostics[0];
    if (firstError.file != null && firstError.start != null) {
      const pos = firstError.file.getLineAndCharacterOfPosition(firstError.start);
      throw new Error(`Parsing error at position [${pos.line + 1}, ${pos.character}]`);
    }
  }
  const sourceFile = program.getSourceFile(filename);
  if (!sourceFile) {
    throw new Error(`No SourceFile found for file ${filename}`);
  }
  return { sourceFile, program };
}

export function createProgram(configFile: string, projectRoot: string): ts.Program {
  const { options, files } = parseTsConfig(configFile, projectRoot);
  const host = ts.createCompilerHost(options, true);
  return ts.createProgram(files, options, host);
}

export function parseTsConfig(tsConfig: string, projectRoot: string): { options: ts.CompilerOptions; files: string[] } {
  let projectDirectory = projectRoot;
  let config: {
    config?: any;
    error?: ts.Diagnostic;
  } = { config: { compilerOptions: {} } };
  if (tsConfig !== DEFAULT_TSCONFIG) {
    projectDirectory = path.dirname(tsConfig);
    config = ts.readConfigFile(tsConfig, ts.sys.readFile);
  }

  if (config.error !== undefined) {
    throw new Error(
      ts.formatDiagnostics([config.error], {
        getCanonicalFileName: f => f,
        getCurrentDirectory: process.cwd,
        getNewLine: () => "\n",
      }),
    );
  }
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: fs.existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => fs.readFileSync(file, "utf8"),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(config.config, parseConfigHost, path.resolve(projectDirectory), {
    noEmit: true,
  });
  if (parsed.errors !== undefined) {
    // ignore warnings and 'TS18003: No inputs were found in config file ...'
    const errors = parsed.errors.filter(d => d.category === ts.DiagnosticCategory.Error && d.code !== 18003);
    if (errors.length !== 0) {
      throw new Error(
        ts.formatDiagnostics(errors, {
          getCanonicalFileName: f => f,
          getCurrentDirectory: process.cwd,
          getNewLine: () => "\n",
        }),
      );
    }
  }
  // make sure traceResolution is disabled because it generates a lot of content on stdout (see #688)
  const options = Object.assign(parsed.options, { traceResolution: false });
  return { options, files: parsed.fileNames };
}
