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
import * as tsutils from "tsutils";
import { SonarRuleMetaData } from "../sonarRule";
import { SymbolicExecution } from "../se/SymbolicExecution";
import { build } from "../cfg/builder";
import { ProgramState } from "../se/programStates";
import { createUnknownSymbolicValue } from "../se/symbolicValues";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-unreachable-block",
    description: "Conditionally executed blocks should be reachable",
    rationale: tslint.Utils.dedent`
      Conditional expressions which are always "true" or "false" can lead to dead code. Such code is always buggy and 
      should never be used in production.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2583",
    type: "functionality",
    typescriptOnly: false,
  };

  public static getMessage(value: string) {
    return `This condition always evaluates to "${value}".`;
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    const { body } = node;
    if (body) {
      const cfg = build(Array.from(body.statements));
      if (!cfg) {
        return;
      }
      const se = new SymbolicExecution(cfg, this.getProgram());
      se.execute(createInitialState(node, this.getProgram()), (node, programStates) => {
        if (
          tsutils.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
          tsutils.isIdentifier(node.left) &&
          tsutils.isIdentifier(node.right)
        ) {
          const leftSymbol = this.getProgram()
            .getTypeChecker()
            .getSymbolAtLocation(node.left);
          const rightSymbol = this.getProgram()
            .getTypeChecker()
            .getSymbolAtLocation(node.right);
          if (leftSymbol !== undefined && rightSymbol !== undefined) {
            if (
              programStates.every(programState => {
                const leftSV = programState.sv(leftSymbol);
                const rightSV = programState.sv(rightSymbol);
                return !!leftSV && !!rightSV && leftSV === rightSV;
              })
            ) {
              this.addFailureAtNode(node, Rule.getMessage("true"));
            }
          }
        }
      });
    }
    super.visitFunctionDeclaration(node);
  }
}

function createInitialState(declaration: ts.FunctionDeclaration, program: ts.Program) {
  let state = ProgramState.empty();
  declaration.parameters.forEach(parameter => {
    const symbol = program.getTypeChecker().getSymbolAtLocation(parameter.name);
    if (symbol) {
      state = state.setSV(symbol, createUnknownSymbolicValue());
    }
  });
  return state;
}
