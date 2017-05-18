import * as ts from "typescript";

export class CFG {
  private source: ts.SourceFile;

  constructor(source: ts.SourceFile) {
    this.source = source;
  }

}
