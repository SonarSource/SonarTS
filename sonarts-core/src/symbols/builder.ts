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
import * as ts from "typescript";
import { collectLeftHandIdentifiers, is, isAssignment } from "../utils/navigation";
import { SymbolTable, UsageFlag } from "./table";
import { TreeVisitor } from "../utils/visitor";

export class SymbolTableBuilder extends TreeVisitor {
  private table = new SymbolTable();

  public static build(sourceFile: ts.SourceFile, program: ts.Program): SymbolTable {
    if (!(sourceFile as any).symbolTable) {
      const builder = new SymbolTableBuilder(program);
      builder.visit(sourceFile);
      (sourceFile as any).symbolTable = builder.table;
    }
    return (sourceFile as any).symbolTable;
  }

  private constructor(private readonly program: ts.Program) {
    super();
  }

  protected visitIdentifier(node: ts.Identifier) {
    this.registerUsageIfMissing(node, UsageFlag.READ);
  }

  protected visitBinaryExpression(node: ts.BinaryExpression) {
    if (isAssignment(node)) {
      this.registerWriteUsageForAssignment(node.left);
    }
    super.visitBinaryExpression(node);
  }

  protected visitVariableDeclaration(node: ts.VariableDeclaration) {
    this.addVariable(node);
    super.visitVariableDeclaration(node);
  }

  protected visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    this.addVariable(node);
    super.visitPropertyDeclaration(node);
  }

  protected visitParameterDeclaration(node: ts.ParameterDeclaration) {
    this.addVariable(node);
    super.visitParameterDeclaration(node);
  }

  protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    if (node.name) this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitFunctionDeclaration(node);
  }

  protected visitClassDeclaration(node: ts.ClassDeclaration) {
    if (node.name) this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitClassDeclaration(node);
  }

  protected visitEnumDeclaration(node: ts.EnumDeclaration) {
    if (node.name) this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitEnumDeclaration(node);
  }

  protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    if (node.name) this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitInterfaceDeclaration(node);
  }

  protected visitNamedImports(node: ts.NamedImports) {
    node.elements.forEach(importSpecifier => this.registerUsageIfMissing(importSpecifier.name, UsageFlag.DECLARATION));
    super.visitNamedImports(node);
  }

  protected visitNamespaceImport(node: ts.NamespaceImport) {
    this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitNamespaceImport(node);
  }

  protected visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
    this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitImportEqualsDeclaration(node);
  }

  protected visitExportAssignment(node: ts.ExportAssignment) {
    // TODO This doesn't seem to intercept 'export let x = 42'
    super.visitExportAssignment(node);
  }

  protected visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    if (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken) {
      this.registerUsageIfMissing(node.operand, UsageFlag.READ | UsageFlag.WRITE);
    }
    super.visitPrefixUnaryExpression(node);
  }

  protected visitPostfixUnaryExpression(node: ts.PostfixUnaryExpression) {
    this.registerUsageIfMissing(node.operand, UsageFlag.READ | UsageFlag.WRITE);
  }

  protected visitModuleDeclaration(node: ts.ModuleDeclaration) {
    this.registerUsageIfMissing(node.name, UsageFlag.DECLARATION);
    super.visitModuleDeclaration(node);
  }

  private registerWriteUsageForAssignment(node: ts.Expression) {
    collectLeftHandIdentifiers(node).identifiers.forEach(identifier =>
      this.registerUsageIfMissing(identifier, UsageFlag.WRITE),
    );
  }

  private addVariable(
    node: ts.VariableDeclaration | ts.ParameterDeclaration | ts.PropertyDeclaration | ts.BindingElement,
  ) {
    const declarationName = node.name;
    if (ts.isIdentifier(declarationName)) {
      let usageFlags = UsageFlag.DECLARATION;
      if (
        node.initializer ||
        is(node, ts.SyntaxKind.Parameter) ||
        is(node.parent, ts.SyntaxKind.ObjectBindingPattern, ts.SyntaxKind.ArrayBindingPattern)
      ) {
        usageFlags += UsageFlag.WRITE;
      }
      this.registerUsageIfMissing(declarationName, usageFlags);
    } else if (ts.isArrayBindingPattern(declarationName) || ts.isObjectBindingPattern(declarationName)) {
      Array.from(declarationName.elements).forEach(element => {
        if (ts.isBindingElement(element)) {
          this.addVariable(element);
        }
      });
    }
  }

  private registerUsageIfMissing(node: ts.Expression, flags: UsageFlag): void {
    if (ts.isParenthesizedExpression(node)) {
      this.registerUsageIfMissing(node.expression, flags);
    } else {
      let symbol = this.program.getTypeChecker().getSymbolAtLocation(node);

      if (node.parent && node.parent.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
        symbol = this.program.getTypeChecker().getShorthandAssignmentValueSymbol(node.parent);
      }
      if (symbol) this.table.registerUsageIfMissing(symbol, node, flags);
    }
  }
}
