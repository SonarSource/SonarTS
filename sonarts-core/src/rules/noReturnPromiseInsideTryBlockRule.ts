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
import * as tslint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";
import { isFunctionDeclaration, isTryStatement } from "../utils/nodes";
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-return-promise-inside-try-block",
    description: "Add await to handle rejection",
    rationale: tslint.Utils.dedent`
      An exception (including reject) thrown by a promise 
      will not be caught be a nesting try block, 
      due to the asynchronous nature of execution. 
      Instead, use catch method of Promise or wrap it inside await expression.
    `,
    optionsDescription: "",
    options: null,
    rspecKey: "4822",
    type: "functionality",
    typescriptOnly: true,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Walker(Rule.metadata.ruleName, program).visit(sourceFile).getIssues();
  }
}

class Walker extends TypedSonarRuleVisitor {
  private static readonly message =
    "Consider using 'await' for the promise(s) inside this 'try' " + "or replace it with 'Promise.catch'.";

  visitReturnStatement(node: ts.ReturnStatement) {
    if (node.expression) {
      const type = this.program.getTypeChecker().getTypeAtLocation(node.expression);
      if (hasThenMethod(type) && isStatementInTryBlock(node)) {
        this.addIssue(node, Walker.message);
      }
    }
    super.visitReturnStatement(node);
  }
}

function isStatementInTryBlock(node: ts.Node) {
  let currentNode = node;
  while (true) {
    const parent = currentNode.parent;
    if (isFunctionDeclaration(parent)) {
      return false;
    }
    if (isTryStatement(parent) && parent.tryBlock === currentNode) {
      return true;
    }
    currentNode = parent;
  }
}

function hasThenMethod(type: ts.Type) {
  const thenProperty = type.getProperty("then");
  return Boolean(thenProperty && thenProperty.flags & ts.SymbolFlags.Method);
}
