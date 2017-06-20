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
    const isVoidType = (type: ts.Node) =>
      type.kind === ts.SyntaxKind.UndefinedKeyword || type.kind === ts.SyntaxKind.VoidKeyword;
    if (func.type) {
      if (func.type.kind === ts.SyntaxKind.UnionType && (func.type as ts.UnionTypeNode).types.find(isVoidType)) {
        return;

      } else if (isVoidType(func.type)) {
        return;
      }
    }

    const cfg = ControlFlowGraph.fromStatements(func.body.statements);
    if (cfg) {
      const start = cfg.getStart();
      const end = cfg.findEnd();
      if (end) {
        const predecessors = end.predecessors.filter(block => block === start || this.blockHasPredecessors(block));
        const allExplicit = predecessors.every(this.lastElementIsExplicitReturn.bind(this));
        const allImplicit = predecessors.every(this.lastElementIsNotExplicitReturn.bind(this));
        if (!(allExplicit || allImplicit)) {
          this.addFailureAt(
            func.getFirstToken().getStart(),
            func.getFirstToken().getWidth(),
            'Refactor this function to use "return" consistently',
          );
        }
      }
    }
  }

  private lastElementIsNotExplicitReturn(cfgBlock: CfgBlock): boolean {
    return !this.lastElementIsExplicitReturn(cfgBlock);
  }

  private lastElementIsExplicitReturn(cfgBlock: CfgBlock): boolean {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    if (!lastElement) {
      return false;
    }
    return lastElement.kind === ts.SyntaxKind.ReturnStatement && !!(lastElement as ts.ReturnStatement).expression;
  }

  private blockHasPredecessors(cfgBlock: any): boolean {
    if (cfgBlock.predecessors) {
      return cfgBlock.predecessors.length > 0;
    }
    return false;
  }
}
