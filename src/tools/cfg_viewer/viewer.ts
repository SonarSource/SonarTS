import * as ts from "typescript";
import {Network} from "vis";
import {CfgBlock, ControlFlowGraph} from "../../cfg/cfg";
import toVisData from "./transformer";

class Viewer {

  private container: any;

  constructor(container: any) {
    this.container = container;
  }

  public show(source: string) {
    const sourceFile = ts.createSourceFile("cfg.ts", source, ts.ScriptTarget.ES2015, true);

    const graph = ControlFlowGraph.fromSource(sourceFile.statements);

    const visGraph = new Network(this.container, toVisData(graph),
      {height: "500px", width: "1000px", nodes: {shape: "box"}},
    );
  }
}

const container = document.getElementById("cfg-container");
const viewer = new Viewer(container);
const button = document.getElementById("refresh-btn");
if (button) {
  button.onclick = (event) => {
    const sourceCode = document.getElementById("source-code") as HTMLTextAreaElement;
    if (sourceCode) viewer.show(sourceCode.value);
  };
}
