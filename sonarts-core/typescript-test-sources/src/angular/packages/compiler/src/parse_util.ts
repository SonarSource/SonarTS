/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as chars from './chars';
import {CompileIdentifierMetadata, identifierModuleUrl, identifierName} from './compile_metadata';

export class ParseLocation {
  constructor(
      public file: ParseSourceFile, public offset: number, public line: number,
      public col: number) {}

  toString(): string {
    return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
  }

  moveBy(delta: number): ParseLocation {
    const source = this.file.content;
    const len = source.length;
    let offset = this.offset;
    let line = this.line;
    let col = this.col;
    while (offset > 0 && delta < 0) {
      offset--;
      delta++;
      const ch = source.charCodeAt(offset);
      if (ch == chars.$LF) {
        line--;
        const priorLine = source.substr(0, offset - 1).lastIndexOf(String.fromCharCode(chars.$LF));
        col = priorLine > 0 ? offset - priorLine : offset;
      } else {
        col--;
      }
    }
    while (offset < len && delta > 0) {
      const ch = source.charCodeAt(offset);
      offset++;
      delta--;
      if (ch == chars.$LF) {
        line++;
        col = 0;
      } else {
        col++;
      }
    }
    return new ParseLocation(this.file, offset, line, col);
  }

  // Return the source around the location
  // Up to `maxChars` or `maxLines` on each side of the location
  getContext(maxChars: number, maxLines: number): {before: string, after: string}|null {
    const content = this.file.content;
    let startOffset = this.offset;

    if (startOffset != null) {
      if (startOffset > content.length - 1) {
        startOffset = content.length - 1;
      }
      let endOffset = startOffset;
      let ctxChars = 0;
      let ctxLines = 0;

      while (ctxChars < maxChars && startOffset > 0) {
        startOffset--;
        ctxChars++;
        if (content[startOffset] == '\n') {
          if (++ctxLines == maxLines) {
            break;
          }
        }
      }

      ctxChars = 0;
      ctxLines = 0;
      while (ctxChars < maxChars && endOffset < content.length - 1) {
        endOffset++;
        ctxChars++;
        if (content[endOffset] == '\n') {
          if (++ctxLines == maxLines) {
            break;
          }
        }
      }

      return {
        before: content.substring(startOffset, this.offset),
        after: content.substring(this.offset, endOffset + 1),
      };
    }

    return null;
  }
}

export class ParseSourceFile {
  constructor(public content: string, public url: string) {}
}

export class ParseSourceSpan {
  constructor(
      public start: ParseLocation, public end: ParseLocation, public details: string|null = null) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}

export enum ParseErrorLevel {
  WARNING,
  ERROR,
}

export class ParseError {
  constructor(
      public span: ParseSourceSpan, public msg: string,
      public level: ParseErrorLevel = ParseErrorLevel.ERROR) {}

  toString(): string {
    const ctx = this.span.start.getContext(100, 3);
    const contextStr =
        ctx ? ` ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")` : '';
    const details = this.span.details ? `, ${this.span.details}` : '';
    return `${this.msg}${contextStr}: ${this.span.start}${details}`;
  }
}

export function typeSourceSpan(kind: string, type: CompileIdentifierMetadata): ParseSourceSpan {
  const moduleUrl = identifierModuleUrl(type);
  const sourceFileName = moduleUrl != null ? `in ${kind} ${identifierName(type)} in ${moduleUrl}` :
                                             `in ${kind} ${identifierName(type)}`;
  const sourceFile = new ParseSourceFile('', sourceFileName);
  return new ParseSourceSpan(
      new ParseLocation(sourceFile, -1, -1, -1), new ParseLocation(sourceFile, -1, -1, -1));
}
