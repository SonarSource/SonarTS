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
import * as nav from "../utils/navigation";
import * as tslint from "tslint";
import * as ts from "typescript";
import { SymbolTableBuilder } from "../symbols/builder";
import { SymbolTable } from "../symbols/table";
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-accessor-field-mismatch",
    description: "Getters and setters should access the expected fields",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-2870",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program, symbols));
  }
}

class Walker extends tslint.ProgramAwareRuleWalker {
  constructor(
    sourceFile: ts.SourceFile,
    options: tslint.IOptions,
    program: ts.Program,
    private readonly symbols: SymbolTable,
  ) {
    super(sourceFile, options, program);
  }

  protected visitMethodDeclaration(method: ts.MethodDeclaration): void {
    this.visitAccessor(method, this.setterOrGetter(method));
    super.visitMethodDeclaration(method);
  }

  protected visitSetAccessor(accessor: ts.AccessorDeclaration): void {
    this.visitAccessor(accessor, { type: "setter", name: Walker.getName(accessor) });
    super.visitSetAccessor(accessor);
  }

  protected visitGetAccessor(accessor: ts.AccessorDeclaration): void {
    this.visitAccessor(accessor, { type: "getter", name: Walker.getName(accessor) });
    super.visitGetAccessor(accessor);
  }

  private visitAccessor(accessor: ts.MethodDeclaration | ts.AccessorDeclaration, setterOrGetter: { type: string; name: string } | undefined) {
    if (!setterOrGetter) {
      return;
    }
    const matchingField = Walker.matchingField(accessor, setterOrGetter.name);
    if (Walker.isPublic(accessor) && accessor.body && matchingField && !this.fieldIsUsed(accessor, matchingField)) {
      this.addFailureAtNode(
        accessor.name,
        `Refactor this ${setterOrGetter.type} so that it actually refers to the property '${matchingField.name.getText()}'`,
      );
    }
  }

  private static isPublic(method: ts.MethodDeclaration | ts.AccessorDeclaration) {
    const modifier = nav.accessModifier(method);
    return modifier && modifier.kind === ts.SyntaxKind.PublicKeyword;
  }

  private static getName(accessor: ts.AccessorDeclaration) {
    return accessor.name.getText().toLowerCase();
  }

  private setterOrGetter(method: ts.MethodDeclaration): { type: string; name: string } | undefined {
    const name = method.name.getText().toLowerCase();
    if (name.startsWith("set") || name.startsWith("Set")) {
      if (method.parameters.length === 1) {
        return { type: "setter", name: name.substring(3) };
      }
    }
    if (name.startsWith("get") || name.startsWith("Get")) {
      if (method.parameters.length === 0) {
        return { type: "getter", name: name.substring(3) };
      }
    }
  }

  private static matchingField(
    method: ts.MethodDeclaration | ts.AccessorDeclaration,
    targetName: string,
  ): ts.PropertyDeclaration | ts.ParameterDeclaration | undefined {
    const containingClass = nav.firstAncestor(method, [
      ts.SyntaxKind.ClassDeclaration,
      ts.SyntaxKind.ClassExpression,
    ]) as ts.ClassDeclaration | ts.ClassExpression;
    if (!containingClass) return;
    return containingClass.members
      .filter(element => element.kind === ts.SyntaxKind.PropertyDeclaration)
      .map(element => element as ts.PropertyDeclaration | ts.ParameterDeclaration)
      .concat(Walker.fieldsDeclaredInConstructorParameters(containingClass))
      .find(element => Walker.fieldNameMatches(element.name.getText(), targetName));
  }

  private static fieldNameMatches(fieldName: string, targetName: string): boolean {
    const fieldNameLowerCase = fieldName.toLowerCase();
    const underscoredTargetName = "_" + targetName;
    return fieldNameLowerCase === targetName || fieldNameLowerCase === underscoredTargetName;
  }

  private static fieldsDeclaredInConstructorParameters(containingClass: ts.ClassDeclaration | ts.ClassExpression) {
    const constr = nav.constructorOf(containingClass);
    if (constr) {
      return constr.parameters.filter(parameter => nav.accessModifier(parameter) || nav.isReadonly(parameter));
    } else {
      return [];
    }
  }

  private fieldIsUsed(
    method: ts.MethodDeclaration | ts.AccessorDeclaration,
    field: ts.PropertyDeclaration | ts.ParameterDeclaration,
  ): boolean {
    const body = method.body;
    const usage = this.symbols.getUsage(field.name);
    if (usage && body) {
      return !!this.symbols.allUsages(usage.symbol).find(usage => usage.isUsedInside(body));
    } else {
      return false;
    }
  }
}
