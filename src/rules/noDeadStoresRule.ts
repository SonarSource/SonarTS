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
import { SonarRuleMetaData } from "../sonarRule";
//import { SymbolTableBuilder } from "../symbols/builder";
//import { SymbolTable } from "../symbols/table";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Dead stores should be removed",
    options: null,
    optionsDescription: "",
    rationale: tslint.Utils.dedent`
      A dead store happens when a local variable is assigned a value that is not read by
      any subsequent instruction or when an object property is assigned a value that is not subsequently used.
      Calculating or retrieving a value only to then overwrite it or throw it away, could indicate a serious error in the code.
      Even if it's not an error, it is at best a waste of resources. Therefore all calculated values should be used.`,
    rspecKey: "RSPEC-1854",
    ruleName: "no-dead-stores",
    type: "functionality",
    typescriptOnly: false,
  };

  public static formatMessage(expression: ts.Expression) {
    if (expression.kind === ts.SyntaxKind.FunctionExpression) {
      return "Remove this use of the output from this function; this function doesn't return anything.";
    } else {
      const name = expression.getText();
      return `Remove this use of the output from "${name}"; "${name}" doesn't return anything.`;
    }
  }

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    //const table = SymbolTableBuilder.build(sourceFile, program);
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  public constructor(
    sourceFile: ts.SourceFile,
    options: tslint.IOptions,
    program: ts.Program
  ) {
    super(sourceFile, options, program);
  }
}
