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
import * as tslint from "tslint";
import * as ts from "typescript";
import { CfgBlock, ControlFlowGraph } from "../cfg/cfg";
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Functions should use 'return' consistently",
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-3801",
    ruleName: "no-inconsistent-return",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public visitFunctionDeclaration(func: ts.FunctionDeclaration) {
    if (!func.body) return;
    const cfg = ControlFlowGraph.fromStatements(func.body.statements);
    const end = cfg.findEnd();
    if (end) {
      const allExplicit = end.predecessors.every(this.lastElementIsReturn.bind(this));
      const allImplicit = end.predecessors.every(this.lastElementIsNotReturn.bind(this));
      if (!(allExplicit || allImplicit)) {
        this.addFailureAt(
          func.getFirstToken().getStart(),
          func.getFirstToken().getWidth(),
          'Refactor this function to use "return" consistently',
        );
      }
    }
  }

  private lastElementIsNotReturn(cfgBlock: CfgBlock): boolean {
    return !this.lastElementIsReturn(cfgBlock);
  }

  private lastElementIsReturn(cfgBlock: CfgBlock): boolean {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    return lastElement.kind === ts.SyntaxKind.ReturnStatement;
  }
}
