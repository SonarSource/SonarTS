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
import { SymbolTableBuilder } from "../symbols/builder";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";
import { isReadUsage, getCollectionSymbols } from "./collectionUtils";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-unused-array",
    description: "Array contents should be used",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4030",
    type: "maintainability",
    typescriptOnly: false,
  };

  private static readonly MESSAGE = "Either use this collection's contents or remove the collection.";

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);

    // walker is created to only save issues
    const visitor = new SonarRuleVisitor(this.getOptions().ruleName);

    getCollectionSymbols(symbols, program)
      // filter out symbols with at least one read usage
      .filter(symbolAndDeclaration => !symbols.allUsages(symbolAndDeclaration.symbol).some(usage => isReadUsage(usage)))
      // raise issue
      .forEach(symbolAndDeclaration => visitor.addIssue(symbolAndDeclaration.declaration, Rule.MESSAGE));

    return visitor.getIssues();
  }
}
