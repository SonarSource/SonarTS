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
import { TypedSonarRuleVisitor } from "../utils/sonarAnalysis";
import { SymbolTableBuilder } from "../symbols/builder";
import { is } from "../utils/nodes";
import { SymbolTable, UsageFlag } from "../symbols/table";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "prefer-base-type",
    description: "Function parameters should be declared with base types",
    rationale: tslint.Utils.dedent``,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-3242",
    type: "maintainability",
    typescriptOnly: true,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName, program, SymbolTableBuilder.build(sourceFile, program))
      .visit(sourceFile)
      .getIssues();
  }

  static message(type: ts.Type, baseType: ts.Type) {
    const baseTypeName = baseType.symbol.name;
    if (baseTypeName === "default") {
      return `Use the parent type here; it is a more general type than '${type.symbol.name}'.`;
    }
    return `Use '${baseTypeName}' here; it is a more general type than '${type.symbol.name}'.`;
  }
}

class Visitor extends TypedSonarRuleVisitor {
  private readonly typeChecker: ts.TypeChecker;

  constructor(ruleName: string, protected program: ts.Program, private readonly symbolTable: SymbolTable) {
    super(ruleName, program);
    this.typeChecker = this.program.getTypeChecker();
  }

  visitParameterDeclaration(node: ts.ParameterDeclaration) {
    const symbol = this.typeChecker.getSymbolAtLocation(node.name);
    if (node.type && symbol && !is(node.parent, ts.SyntaxKind.ArrowFunction)) {
      const usedProperties = this.getUsedProperties(symbol);
      if (usedProperties.length > 0) {
        const type = this.typeChecker.getTypeFromTypeNode(node.type);
        const mostGeneralizedType = this.findMostGeneralizedType(type, usedProperties);
        if (mostGeneralizedType) {
          this.addIssue(node.type, Rule.message(type, mostGeneralizedType));
        }
      }
    }

    super.visitParameterDeclaration(node);
  }

  findMostGeneralizedType(type: ts.Type, usedProperties: string[]): ts.Type | undefined {
    if (type.isClassOrInterface()) {
      const baseTypes = this.program.getTypeChecker().getBaseTypes(type);
      for (const baseType of baseTypes) {
        const propertiesOfBaseType = this.program
          .getTypeChecker()
          .getPropertiesOfType(baseType)
          .map(p => p.name);
        const canBeGeneralized = usedProperties.every(prop => propertiesOfBaseType.includes(prop));

        if (canBeGeneralized) {
          const mostGeneralizedType = this.findMostGeneralizedType(baseType, usedProperties);
          return mostGeneralizedType ? mostGeneralizedType : baseType;
        }
      }
    }
    return undefined;
  }

  getUsedProperties(symbol: ts.Symbol): string[] {
    const usedProperties: string[] = [];
    let symbolUsedOnlyForProperties = true;

    this.symbolTable.allUsages(symbol).forEach(usage => {
      if (usage.is(UsageFlag.DECLARATION)) {
        return;
      }
      const parent = usage.node.parent;

      if (is(parent, ts.SyntaxKind.PropertyAccessExpression)) {
        const propSymbol = this.typeChecker.getSymbolAtLocation((parent as ts.PropertyAccessExpression).name);
        if (propSymbol) {
          usedProperties.push(propSymbol.name);
          return;
        }
      }
      symbolUsedOnlyForProperties = false;
    });

    return symbolUsedOnlyForProperties ? usedProperties : [];
  }
}
