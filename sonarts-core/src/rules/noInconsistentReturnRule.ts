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
import * as tslint from "tslint";
import * as ts from "typescript";
import { CfgBlock, ControlFlowGraph } from "../cfg/cfg";
import { SonarRuleMetaData } from "../sonarRule";
import { functionLikeMainToken } from "../utils/navigation";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    description: 'Functions should use "return" consistently',
    options: null,
    optionsDescription: "",
    rspecKey: "RSPEC-3801",
    ruleName: "no-inconsistent-return",
    type: "maintainability",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  public visitFunctionDeclaration(func: ts.FunctionDeclaration) {
    if (!func.body) return;
    this.checkFunctionLikeDeclaration(func, func.body, func.type);
  }

  public visitMethodDeclaration(meth: ts.MethodDeclaration) {
    if (!meth.body) return;
    this.checkFunctionLikeDeclaration(meth, meth.body, meth.type);
  }

  public visitGetAccessor(accessor: ts.AccessorDeclaration) {
    if (!accessor.body) return;
    this.checkFunctionLikeDeclaration(accessor, accessor.body, accessor.type);
  }

  public visitArrowFunction(func: ts.ArrowFunction) {
    if (func.body.kind === ts.SyntaxKind.Block) {
      this.checkFunctionLikeDeclaration(func, func.body as ts.Block, func.type);
    }
  }

  private checkFunctionLikeDeclaration(
    functionNode: ts.FunctionLikeDeclaration,
    body: ts.Block,
    returnType?: ts.TypeNode,
  ) {
    if (this.declaredReturnTypeContainsVoidTypes(returnType)) return;
    const cfg = ControlFlowGraph.fromStatements(Array.from(body.statements));
    if (cfg) {
      const predecessors = cfg.getEndPredecessors();
      const hasExplicit = predecessors.find(this.lastElementIsExplicitReturn);
      const hasImplicit = predecessors.find(this.lastElementIsNotExplicitReturn);
      if (hasExplicit && hasImplicit) {
        this.addIssue(functionLikeMainToken(functionNode), 'Refactor this function to use "return" consistently');
      }
    }
  }

  private declaredReturnTypeContainsVoidTypes(returnType?: ts.TypeNode) {
    if (returnType) {
      if (returnType.kind === ts.SyntaxKind.UnionType && (returnType as ts.UnionTypeNode).types.find(isVoidType)) {
        return true;
      } else if (isVoidType(returnType)) {
        return true;
      }
    }

    return false;

    function isVoidType(type: ts.Node) {
      return type.kind === ts.SyntaxKind.UndefinedKeyword || type.kind === ts.SyntaxKind.VoidKeyword;
    }
  }

  private lastElementIsNotExplicitReturn(cfgBlock: CfgBlock): boolean {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    if (!lastElement) {
      return false;
    }

    if (lastElement.kind === ts.SyntaxKind.ThrowStatement) {
      return false;
    }
    return lastElement.kind !== ts.SyntaxKind.ReturnStatement || !(lastElement as ts.ReturnStatement).expression;
  }

  private lastElementIsExplicitReturn(cfgBlock: CfgBlock): boolean {
    const elements = cfgBlock.getElements();
    const lastElement = elements[elements.length - 1];
    if (!lastElement) {
      return false;
    }

    if (lastElement.kind === ts.SyntaxKind.ThrowStatement) {
      return false;
    }
    return lastElement.kind === ts.SyntaxKind.ReturnStatement && !!(lastElement as ts.ReturnStatement).expression;
  }
}
