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
import { SonarRuleMetaData } from "../sonarRule";
import { SymbolTableBuilder } from "../symbols/builder";
import { SymbolTable } from "../symbols/table";
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { isReturnStatement, isThrowStatement, isIdentifier, isVariableStatement } from "../utils/nodes";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-immediate-return",
    description: "Local variables should not be declared and then immediately returned or thrown",
    optionsDescription: "",
    options: null,
    rationale: tslint.Utils.dedent`
      Declaring a variable only to immediately return or throw it is a bad practice. Some developers argue that the 
      practice improves code readability, because it enables them to explicitly name what is being returned. However, 
      this variable is an internal implementation detail that is not exposed to the callers of the method. The method 
      name should be sufficient for callers to know exactly what will be returned.`,
    rspecKey: "RSPEC-1488",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return new Visitor(this.getOptions(), program, symbols).visit(sourceFile).getIssues();
  }
}

class Visitor extends TypedSonarRuleVisitor {
  constructor(options: tslint.IOptions, program: ts.Program, private readonly symbols: SymbolTable) {
    super(options.ruleName, program);
  }

  protected visitBlock(node: ts.Block) {
    this.processStatements(node.statements);
    super.visitBlock(node);
  }

  protected visitCaseClause(node: ts.CaseClause) {
    this.processStatements(node.statements);
    super.visitCaseClause(node);
  }

  protected visitDefaultClause(node: ts.DefaultClause) {
    this.processStatements(node.statements);
    super.visitDefaultClause(node);
  }

  private processStatements(statements: ts.NodeArray<ts.Statement>) {
    if (statements.length > 1) {
      const last = statements[statements.length - 1];
      const returnedVariable = this.getOnlyReturnedVariable(last);

      const lastButOne = statements[statements.length - 2];
      const declaredVariable = this.getOnlyDeclaredVariable(lastButOne);

      if (returnedVariable && declaredVariable) {
        const returnedSymbol = this.program.getTypeChecker().getSymbolAtLocation(returnedVariable);
        const declaredSymbol = this.program.getTypeChecker().getSymbolAtLocation(declaredVariable.name);

        if (
          returnedSymbol &&
          returnedSymbol === declaredSymbol &&
          !this.symbols.allUsages(declaredSymbol).some(usage => usage.isUsedInside(declaredVariable.initializer))
        ) {
          this.addIssue(declaredVariable.initializer, this.formatMessage(last, returnedVariable.text));
        }
      }
    }
  }

  private getOnlyReturnedVariable(node: ts.Node) {
    return (isReturnStatement(node) || isThrowStatement(node)) && node.expression && isIdentifier(node.expression)
      ? node.expression
      : undefined;
  }

  private getOnlyDeclaredVariable(node: ts.Node) {
    if (isVariableStatement(node) && node.declarationList.declarations.length === 1) {
      const { name, initializer } = node.declarationList.declarations[0];
      if (isIdentifier(name) && initializer) {
        return { name, initializer };
      }
    }
    return undefined;
  }

  private formatMessage(node: ts.Node, variable: string) {
    const action = isReturnStatement(node) ? "return" : "throw";
    return `Immediately ${action} this expression instead of assigning it to the temporary variable "${variable}".`;
  }
}
