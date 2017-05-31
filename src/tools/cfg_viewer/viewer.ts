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
import * as ts from "typescript";
import { Network } from "vis";
import { CfgBlock, ControlFlowGraph } from "../../cfg/cfg";
import toVisData from "./transformer";

class Viewer {

  private container: any;

  constructor(container: any) {
    this.container = container;
  }

  public show(source: string) {
    const sourceFile = ts.createSourceFile("cfg.ts", source, ts.ScriptTarget.ES2015, true);

    try {
      const graph = ControlFlowGraph.fromSource(sourceFile.statements);

      const visGraph = new Network(this.container, toVisData(graph),
        { height: "500px", width: "1000px", nodes: { shape: "box" } },
      );

    } catch (e) {
      alert(e);
    }

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
