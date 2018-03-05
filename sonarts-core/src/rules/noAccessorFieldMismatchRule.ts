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
import * as nav from "../utils/navigation";
import * as tslint from "tslint";
import * as ts from "typescript";
import { SymbolTableBuilder } from "../symbols/builder";
import { SymbolTable } from "../symbols/table";
import { SonarRuleMetaData } from "../sonarRule";
import { SonarRuleVisitor } from "../utils/sonarAnalysis";

export class Rule extends tslint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-accessor-field-mismatch",
    description: "Getters and setters should access the expected fields",
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-4275",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    const symbols = SymbolTableBuilder.build(sourceFile, program);
    return new Visitor(this.getOptions(), symbols).visit(sourceFile).getIssues();
  }
}

class Visitor extends SonarRuleVisitor {
  constructor(options: tslint.IOptions, private readonly symbols: SymbolTable) {
    super(options.ruleName);
  }

  protected visitMethodDeclaration(method: ts.MethodDeclaration): void {
    this.visitAccessor(method, this.setterOrGetter(method));
    super.visitMethodDeclaration(method);
  }

  protected visitSetAccessor(accessor: ts.AccessorDeclaration): void {
    this.visitAccessor(accessor, { type: "setter", name: Visitor.getName(accessor) });
    super.visitSetAccessor(accessor);
  }

  protected visitGetAccessor(accessor: ts.AccessorDeclaration): void {
    this.visitAccessor(accessor, { type: "getter", name: Visitor.getName(accessor) });
    super.visitGetAccessor(accessor);
  }

  private visitAccessor(
    accessor: ts.MethodDeclaration | ts.AccessorDeclaration,
    setterOrGetter: { type: string; name: string } | undefined,
  ) {
    if (!setterOrGetter) {
      return;
    }

    const containingStructure = nav.firstAncestor(accessor, [
      ts.SyntaxKind.ClassDeclaration,
      ts.SyntaxKind.ClassExpression,
      ts.SyntaxKind.ObjectLiteralExpression,
    ]) as ts.ClassDeclaration | ts.ClassExpression | ts.ObjectLiteralExpression;
    let matchingFields: Field[];
    let accessorIsPublic: boolean;
    if (containingStructure.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      matchingFields = Visitor.matchingFields(Array.from(containingStructure.properties), [], setterOrGetter.name);
      accessorIsPublic = true;
    } else {
      matchingFields = Visitor.matchingFields(
        Array.from(containingStructure.members),
        Visitor.fieldsDeclaredInConstructorParameters(containingStructure),
        setterOrGetter.name,
      );
      accessorIsPublic = Visitor.isPublic(accessor);
    }
    if (
      accessorIsPublic &&
      accessor.body &&
      matchingFields.length > 0 &&
      Visitor.bodyIsSimple(accessor.body, setterOrGetter.type) &&
      !this.fieldIsUsed(accessor, matchingFields)
    ) {
      this.addIssue(
        accessor.name,
        `Refactor this ${setterOrGetter.type} so that it actually refers to the property '${matchingFields[0]
          .name!.getText()}'`,
      ).addSecondaryLocation(matchingFields[0], "Property which should be referred.");
    }
  }

  private static isPublic(method: ts.MethodDeclaration | ts.AccessorDeclaration): boolean {
    const modifier = nav.accessModifier(method);
    return !!modifier && modifier.kind === ts.SyntaxKind.PublicKeyword;
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

  private static matchingFields(
    members: Array<ts.ClassElement | ts.ObjectLiteralElement>,
    constructorDeclaredParameters: Array<ts.ParameterDeclaration>,
    targetName: string,
  ): Field[] {
    return members
      .filter(
        element =>
          element.kind === ts.SyntaxKind.PropertyDeclaration ||
          element.kind === ts.SyntaxKind.PropertyAssignment ||
          element.kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
          element.kind === ts.SyntaxKind.JsxAttribute,
      )
      .map(element => element as Field)
      .concat(constructorDeclaredParameters)
      .filter(element => !!element.name && Visitor.fieldNameMatches(element.name.getText(), targetName));
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

  private static bodyIsSimple(body: ts.Block, type: string): boolean {
    if (body.statements.length > 1) {
      return false;
    }
    if (body.statements.length == 0) {
      return true;
    }
    const statement = body.statements[0];
    if (type === "setter") {
      if (statement.kind === ts.SyntaxKind.ExpressionStatement) {
        return (statement as ts.ExpressionStatement).expression.kind === ts.SyntaxKind.BinaryExpression;
      }
      return false;
    } else {
      if (statement.kind === ts.SyntaxKind.ReturnStatement) {
        const expression = (statement as ts.ReturnStatement).expression;
        if (expression) {
          return !!expression.getText().startsWith("this.");
        }
      }
      return false;
    }
  }

  private fieldIsUsed(method: ts.MethodDeclaration | ts.AccessorDeclaration, fields: Field[]): boolean {
    const body = method.body;
    for (const field of fields) {
      const usage = this.symbols.getUsage(field.name!);
      if (usage && body && !!this.symbols.allUsages(usage.symbol).find(usage => usage.isUsedInside(body))) {
        return true;
      }
    }
    return false;
  }
}

type Field = ts.PropertyDeclaration | ts.ParameterDeclaration | ts.ObjectLiteralElement;
