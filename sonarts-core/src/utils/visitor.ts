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

import * as ts from "typescript";

export class TreeVisitor {
  public visit(node: ts.Node) {
    this.visitNode(node);
    return this;
  }

  protected visitAnyKeyword(node: ts.Node) {
    this.visitChildren(node);
  }

  protected visitArrayLiteralExpression(node: ts.ArrayLiteralExpression) {
    this.visitChildren(node);
  }

  protected visitArrayType(node: ts.ArrayTypeNode) {
    this.visitChildren(node);
  }

  protected visitArrowFunction(node: ts.ArrowFunction) {
    this.visitChildren(node);
  }

  protected visitAwaitExpression(node: ts.AwaitExpression) {
    this.visitChildren(node);
  }

  protected visitBinaryExpression(node: ts.BinaryExpression) {
    this.visitChildren(node);
  }

  protected visitBindingElement(node: ts.BindingElement) {
    this.visitChildren(node);
  }

  protected visitBindingPattern(node: ts.BindingPattern) {
    this.visitChildren(node);
  }

  protected visitBlock(node: ts.Block) {
    this.visitChildren(node);
  }

  protected visitBreakStatement(node: ts.BreakOrContinueStatement) {
    this.visitChildren(node);
  }

  protected visitCallExpression(node: ts.CallExpression) {
    this.visitChildren(node);
  }

  protected visitCallSignature(node: ts.SignatureDeclaration) {
    this.visitChildren(node);
  }

  protected visitCaseClause(node: ts.CaseClause) {
    this.visitChildren(node);
  }

  protected visitClassDeclaration(node: ts.ClassDeclaration) {
    this.visitChildren(node);
  }

  protected visitClassExpression(node: ts.ClassExpression) {
    this.visitChildren(node);
  }

  protected visitCatchClause(node: ts.CatchClause) {
    this.visitChildren(node);
  }

  protected visitConditionalExpression(node: ts.ConditionalExpression) {
    this.visitChildren(node);
  }

  protected visitConstructSignature(node: ts.ConstructSignatureDeclaration) {
    this.visitChildren(node);
  }

  protected visitConstructorDeclaration(node: ts.ConstructorDeclaration) {
    this.visitChildren(node);
  }

  protected visitConstructorType(node: ts.FunctionOrConstructorTypeNode) {
    this.visitChildren(node);
  }

  protected visitContinueStatement(node: ts.BreakOrContinueStatement) {
    this.visitChildren(node);
  }

  protected visitDebuggerStatement(node: ts.Statement) {
    this.visitChildren(node);
  }

  protected visitDefaultClause(node: ts.DefaultClause) {
    this.visitChildren(node);
  }

  protected visitDeleteExpression(node: ts.DeleteExpression) {
    this.visitChildren(node);
  }

  protected visitDoStatement(node: ts.DoStatement) {
    this.visitChildren(node);
  }

  protected visitElementAccessExpression(node: ts.ElementAccessExpression) {
    this.visitChildren(node);
  }

  protected visitEndOfFileToken(node: ts.Node) {
    this.visitChildren(node);
  }

  protected visitEnumDeclaration(node: ts.EnumDeclaration) {
    this.visitChildren(node);
  }

  protected visitEnumMember(node: ts.EnumMember) {
    this.visitChildren(node);
  }

  protected visitExportAssignment(node: ts.ExportAssignment) {
    this.visitChildren(node);
  }

  protected visitExpressionStatement(node: ts.ExpressionStatement) {
    this.visitChildren(node);
  }

  protected visitForStatement(node: ts.ForStatement) {
    this.visitChildren(node);
  }

  protected visitForInStatement(node: ts.ForInStatement) {
    this.visitChildren(node);
  }

  protected visitForOfStatement(node: ts.ForOfStatement) {
    this.visitChildren(node);
  }

  protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {
    this.visitChildren(node);
  }

  protected visitFunctionExpression(node: ts.FunctionExpression) {
    this.visitChildren(node);
  }

  protected visitFunctionType(node: ts.FunctionOrConstructorTypeNode) {
    this.visitChildren(node);
  }

  protected visitGetAccessor(node: ts.AccessorDeclaration) {
    this.visitChildren(node);
  }

  protected visitIdentifier(node: ts.Identifier) {
    this.visitChildren(node);
  }

  protected visitIfStatement(node: ts.IfStatement) {
    this.visitChildren(node);
  }

  protected visitImportDeclaration(node: ts.ImportDeclaration) {
    this.visitChildren(node);
  }

  protected visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
    this.visitChildren(node);
  }

  protected visitIndexSignatureDeclaration(node: ts.IndexSignatureDeclaration) {
    this.visitChildren(node);
  }

  protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    this.visitChildren(node);
  }

  protected visitIntersectionTypeNode(node: ts.IntersectionTypeNode) {
    this.visitChildren(node);
  }

  protected visitJsxAttribute(node: ts.JsxAttribute) {
    this.visitChildren(node);
  }

  protected visitJsxElement(node: ts.JsxElement) {
    this.visitChildren(node);
  }

  protected visitJsxExpression(node: ts.JsxExpression) {
    this.visitChildren(node);
  }

  protected visitJsxSelfClosingElement(node: ts.JsxSelfClosingElement) {
    this.visitChildren(node);
  }

  protected visitJsxSpreadAttribute(node: ts.JsxSpreadAttribute) {
    this.visitChildren(node);
  }

  protected visitLabeledStatement(node: ts.LabeledStatement) {
    this.visitChildren(node);
  }

  protected visitMethodDeclaration(node: ts.MethodDeclaration) {
    this.visitChildren(node);
  }

  protected visitMethodSignature(node: ts.SignatureDeclaration) {
    this.visitChildren(node);
  }

  protected visitModuleDeclaration(node: ts.ModuleDeclaration) {
    this.visitChildren(node);
  }

  protected visitNamedImports(node: ts.NamedImports) {
    this.visitChildren(node);
  }

  protected visitNamespaceImport(node: ts.NamespaceImport) {
    this.visitChildren(node);
  }

  protected visitNewExpression(node: ts.NewExpression) {
    this.visitChildren(node);
  }

  protected visitNonNullExpression(node: ts.NonNullExpression) {
    this.visitChildren(node);
  }

  protected visitNoSubstitionTemplateLiteral(node: ts.NoSubstitutionTemplateLiteral) {
    this.visitChildren(node);
  }

  protected visitNumericLiteral(node: ts.NumericLiteral) {
    this.visitChildren(node);
  }

  protected visitObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
    this.visitChildren(node);
  }

  protected visitParameterDeclaration(node: ts.ParameterDeclaration) {
    this.visitChildren(node);
  }

  protected visitParenthesizedExpression(node: ts.ParenthesizedExpression) {
    this.visitChildren(node);
  }

  protected visitPostfixUnaryExpression(node: ts.PostfixUnaryExpression) {
    this.visitChildren(node);
  }

  protected visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.visitChildren(node);
  }

  protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    this.visitChildren(node);
  }

  protected visitPropertyAssignment(node: ts.PropertyAssignment) {
    this.visitChildren(node);
  }

  protected visitPropertyDeclaration(node: ts.PropertyDeclaration) {
    this.visitChildren(node);
  }

  protected visitPropertySignature(node: ts.Node) {
    this.visitChildren(node);
  }

  protected visitRegularExpressionLiteral(node: ts.Node) {
    this.visitChildren(node);
  }

  protected visitReturnStatement(node: ts.ReturnStatement) {
    this.visitChildren(node);
  }

  protected visitSetAccessor(node: ts.AccessorDeclaration) {
    this.visitChildren(node);
  }

  protected visitSourceFile(node: ts.SourceFile) {
    this.visitChildren(node);
  }

  protected visitStringLiteral(node: ts.StringLiteral) {
    this.visitChildren(node);
  }

  protected visitSwitchStatement(node: ts.SwitchStatement) {
    this.visitChildren(node);
  }

  protected visitTemplateExpression(node: ts.TemplateExpression) {
    this.visitChildren(node);
  }

  protected visitThrowStatement(node: ts.ThrowStatement) {
    this.visitChildren(node);
  }

  protected visitTryStatement(node: ts.TryStatement) {
    this.visitChildren(node);
  }

  protected visitTupleType(node: ts.TupleTypeNode) {
    this.visitChildren(node);
  }

  protected visitTypeAliasDeclaration(node: ts.TypeAliasDeclaration) {
    this.visitChildren(node);
  }

  protected visitTypeAssertionExpression(node: ts.TypeAssertion) {
    this.visitChildren(node);
  }

  protected visitTypeLiteral(node: ts.TypeLiteralNode) {
    this.visitChildren(node);
  }

  protected visitTypeReference(node: ts.TypeReferenceNode) {
    this.visitChildren(node);
  }

  protected visitUnionTypeNode(node: ts.UnionTypeNode) {
    this.visitChildren(node);
  }

  protected visitVariableDeclaration(node: ts.VariableDeclaration) {
    this.visitChildren(node);
  }

  protected visitVariableDeclarationList(node: ts.VariableDeclarationList) {
    this.visitChildren(node);
  }

  protected visitVariableStatement(node: ts.VariableStatement) {
    this.visitChildren(node);
  }

  protected visitWhileStatement(node: ts.WhileStatement) {
    this.visitChildren(node);
  }

  protected visitWithStatement(node: ts.WithStatement) {
    this.visitChildren(node);
  }

  protected visitFunctionLikeDeclaration(node: ts.FunctionLikeDeclaration) {
    switch (node.kind) {
      case ts.SyntaxKind.Constructor:
        this.visitConstructorDeclaration(node);
        break;

      case ts.SyntaxKind.ArrowFunction:
        this.visitArrowFunction(node);
        break;

      case ts.SyntaxKind.FunctionDeclaration:
        this.visitFunctionDeclaration(node);
        break;

      case ts.SyntaxKind.FunctionExpression:
        this.visitFunctionExpression(node);
        break;

      case ts.SyntaxKind.MethodDeclaration:
        this.visitMethodDeclaration(node);
        break;

      case ts.SyntaxKind.SetAccessor:
        this.visitSetAccessor(node);
        break;

      case ts.SyntaxKind.GetAccessor:
        this.visitGetAccessor(node);
        break;
    }
  }

  protected visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.AnyKeyword:
        this.visitAnyKeyword(node);
        break;

      case ts.SyntaxKind.ArrayBindingPattern:
        this.visitBindingPattern(node as ts.BindingPattern);
        break;

      case ts.SyntaxKind.ArrayLiteralExpression:
        this.visitArrayLiteralExpression(node as ts.ArrayLiteralExpression);
        break;

      case ts.SyntaxKind.ArrayType:
        this.visitArrayType(node as ts.ArrayTypeNode);
        break;

      case ts.SyntaxKind.AwaitExpression:
        this.visitAwaitExpression(node as ts.AwaitExpression);
        break;

      case ts.SyntaxKind.BinaryExpression:
        this.visitBinaryExpression(node as ts.BinaryExpression);
        break;

      case ts.SyntaxKind.BindingElement:
        this.visitBindingElement(node as ts.BindingElement);
        break;

      case ts.SyntaxKind.Block:
        this.visitBlock(node as ts.Block);
        break;

      case ts.SyntaxKind.BreakStatement:
        this.visitBreakStatement(node as ts.BreakOrContinueStatement);
        break;

      case ts.SyntaxKind.CallExpression:
        this.visitCallExpression(node as ts.CallExpression);
        break;

      case ts.SyntaxKind.CallSignature:
        this.visitCallSignature(node as ts.SignatureDeclaration);
        break;

      case ts.SyntaxKind.CaseClause:
        this.visitCaseClause(node as ts.CaseClause);
        break;

      case ts.SyntaxKind.ClassDeclaration:
        this.visitClassDeclaration(node as ts.ClassDeclaration);
        break;

      case ts.SyntaxKind.ClassExpression:
        this.visitClassExpression(node as ts.ClassExpression);
        break;

      case ts.SyntaxKind.CatchClause:
        this.visitCatchClause(node as ts.CatchClause);
        break;

      case ts.SyntaxKind.ConditionalExpression:
        this.visitConditionalExpression(node as ts.ConditionalExpression);
        break;

      case ts.SyntaxKind.ConstructSignature:
        this.visitConstructSignature(node as ts.ConstructSignatureDeclaration);
        break;

      case ts.SyntaxKind.ConstructorType:
        this.visitConstructorType(node as ts.FunctionOrConstructorTypeNode);
        break;

      case ts.SyntaxKind.ContinueStatement:
        this.visitContinueStatement(node as ts.BreakOrContinueStatement);
        break;

      case ts.SyntaxKind.DebuggerStatement:
        this.visitDebuggerStatement(node as ts.Statement);
        break;

      case ts.SyntaxKind.DefaultClause:
        this.visitDefaultClause(node as ts.DefaultClause);
        break;

      case ts.SyntaxKind.DeleteExpression:
        this.visitDeleteExpression(node as ts.DeleteExpression);
        break;

      case ts.SyntaxKind.DoStatement:
        this.visitDoStatement(node as ts.DoStatement);
        break;

      case ts.SyntaxKind.ElementAccessExpression:
        this.visitElementAccessExpression(node as ts.ElementAccessExpression);
        break;

      case ts.SyntaxKind.EndOfFileToken:
        this.visitEndOfFileToken(node);
        break;

      case ts.SyntaxKind.EnumDeclaration:
        this.visitEnumDeclaration(node as ts.EnumDeclaration);
        break;

      case ts.SyntaxKind.EnumMember:
        this.visitEnumMember(node as ts.EnumMember);
        break;

      case ts.SyntaxKind.ExportAssignment:
        this.visitExportAssignment(node as ts.ExportAssignment);
        break;

      case ts.SyntaxKind.ExpressionStatement:
        this.visitExpressionStatement(node as ts.ExpressionStatement);
        break;

      case ts.SyntaxKind.ForStatement:
        this.visitForStatement(node as ts.ForStatement);
        break;

      case ts.SyntaxKind.ForInStatement:
        this.visitForInStatement(node as ts.ForInStatement);
        break;

      case ts.SyntaxKind.ForOfStatement:
        this.visitForOfStatement(node as ts.ForOfStatement);
        break;

      case ts.SyntaxKind.FunctionType:
        this.visitFunctionType(node as ts.FunctionOrConstructorTypeNode);
        break;

      case ts.SyntaxKind.Identifier:
        this.visitIdentifier(node as ts.Identifier);
        break;

      case ts.SyntaxKind.IfStatement:
        this.visitIfStatement(node as ts.IfStatement);
        break;

      case ts.SyntaxKind.ImportDeclaration:
        this.visitImportDeclaration(node as ts.ImportDeclaration);
        break;

      case ts.SyntaxKind.ImportEqualsDeclaration:
        this.visitImportEqualsDeclaration(node as ts.ImportEqualsDeclaration);
        break;

      case ts.SyntaxKind.IndexSignature:
        this.visitIndexSignatureDeclaration(node as ts.IndexSignatureDeclaration);
        break;

      case ts.SyntaxKind.InterfaceDeclaration:
        this.visitInterfaceDeclaration(node as ts.InterfaceDeclaration);
        break;

      case ts.SyntaxKind.IntersectionType:
        this.visitIntersectionTypeNode(node as ts.IntersectionTypeNode);
        break;

      case ts.SyntaxKind.JsxAttribute:
        this.visitJsxAttribute(node as ts.JsxAttribute);
        break;

      case ts.SyntaxKind.JsxElement:
        this.visitJsxElement(node as ts.JsxElement);
        break;

      case ts.SyntaxKind.JsxExpression:
        this.visitJsxExpression(node as ts.JsxExpression);
        break;

      case ts.SyntaxKind.JsxSelfClosingElement:
        this.visitJsxSelfClosingElement(node as ts.JsxSelfClosingElement);
        break;

      case ts.SyntaxKind.JsxSpreadAttribute:
        this.visitJsxSpreadAttribute(node as ts.JsxSpreadAttribute);
        break;

      case ts.SyntaxKind.LabeledStatement:
        this.visitLabeledStatement(node as ts.LabeledStatement);
        break;

      case ts.SyntaxKind.MethodSignature:
        this.visitMethodSignature(node as ts.SignatureDeclaration);
        break;

      case ts.SyntaxKind.ModuleDeclaration:
        this.visitModuleDeclaration(node as ts.ModuleDeclaration);
        break;

      case ts.SyntaxKind.NamedImports:
        this.visitNamedImports(node as ts.NamedImports);
        break;

      case ts.SyntaxKind.NamespaceImport:
        this.visitNamespaceImport(node as ts.NamespaceImport);
        break;

      case ts.SyntaxKind.NewExpression:
        this.visitNewExpression(node as ts.NewExpression);
        break;

      case ts.SyntaxKind.NonNullExpression:
        this.visitNonNullExpression(node as ts.NonNullExpression);
        break;

      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        this.visitNoSubstitionTemplateLiteral(node as ts.NoSubstitutionTemplateLiteral);
        break;

      case ts.SyntaxKind.NumericLiteral:
        this.visitNumericLiteral(node as ts.NumericLiteral);
        break;

      case ts.SyntaxKind.ObjectBindingPattern:
        this.visitBindingPattern(node as ts.BindingPattern);
        break;

      case ts.SyntaxKind.ObjectLiteralExpression:
        this.visitObjectLiteralExpression(node as ts.ObjectLiteralExpression);
        break;

      case ts.SyntaxKind.Parameter:
        this.visitParameterDeclaration(node as ts.ParameterDeclaration);
        break;

      case ts.SyntaxKind.ParenthesizedExpression:
        this.visitParenthesizedExpression(node as ts.ParenthesizedExpression);
        break;

      case ts.SyntaxKind.PostfixUnaryExpression:
        this.visitPostfixUnaryExpression(node as ts.PostfixUnaryExpression);
        break;

      case ts.SyntaxKind.PrefixUnaryExpression:
        this.visitPrefixUnaryExpression(node as ts.PrefixUnaryExpression);
        break;

      case ts.SyntaxKind.PropertyAccessExpression:
        this.visitPropertyAccessExpression(node as ts.PropertyAccessExpression);
        break;

      case ts.SyntaxKind.PropertyAssignment:
        this.visitPropertyAssignment(node as ts.PropertyAssignment);
        break;

      case ts.SyntaxKind.PropertyDeclaration:
        this.visitPropertyDeclaration(node as ts.PropertyDeclaration);
        break;

      case ts.SyntaxKind.PropertySignature:
        this.visitPropertySignature(node);
        break;

      case ts.SyntaxKind.RegularExpressionLiteral:
        this.visitRegularExpressionLiteral(node);
        break;

      case ts.SyntaxKind.ReturnStatement:
        this.visitReturnStatement(node as ts.ReturnStatement);
        break;

      case ts.SyntaxKind.SourceFile:
        this.visitSourceFile(node as ts.SourceFile);
        break;

      case ts.SyntaxKind.StringLiteral:
        this.visitStringLiteral(node as ts.StringLiteral);
        break;

      case ts.SyntaxKind.SwitchStatement:
        this.visitSwitchStatement(node as ts.SwitchStatement);
        break;

      case ts.SyntaxKind.TemplateExpression:
        this.visitTemplateExpression(node as ts.TemplateExpression);
        break;

      case ts.SyntaxKind.ThrowStatement:
        this.visitThrowStatement(node as ts.ThrowStatement);
        break;

      case ts.SyntaxKind.TryStatement:
        this.visitTryStatement(node as ts.TryStatement);
        break;

      case ts.SyntaxKind.TupleType:
        this.visitTupleType(node as ts.TupleTypeNode);
        break;

      case ts.SyntaxKind.TypeAliasDeclaration:
        this.visitTypeAliasDeclaration(node as ts.TypeAliasDeclaration);
        break;

      case ts.SyntaxKind.TypeAssertionExpression:
        this.visitTypeAssertionExpression(node as ts.TypeAssertion);
        break;

      case ts.SyntaxKind.TypeLiteral:
        this.visitTypeLiteral(node as ts.TypeLiteralNode);
        break;

      case ts.SyntaxKind.TypeReference:
        this.visitTypeReference(node as ts.TypeReferenceNode);
        break;

      case ts.SyntaxKind.UnionType:
        this.visitUnionTypeNode(node as ts.UnionTypeNode);
        break;

      case ts.SyntaxKind.VariableDeclaration:
        this.visitVariableDeclaration(node as ts.VariableDeclaration);
        break;

      case ts.SyntaxKind.VariableDeclarationList:
        this.visitVariableDeclarationList(node as ts.VariableDeclarationList);
        break;

      case ts.SyntaxKind.VariableStatement:
        this.visitVariableStatement(node as ts.VariableStatement);
        break;

      case ts.SyntaxKind.WhileStatement:
        this.visitWhileStatement(node as ts.WhileStatement);
        break;

      case ts.SyntaxKind.WithStatement:
        this.visitWithStatement(node as ts.WithStatement);
        break;

      case ts.SyntaxKind.Constructor:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.SetAccessor:
      case ts.SyntaxKind.GetAccessor:
        this.visitFunctionLikeDeclaration(node as ts.FunctionLikeDeclaration);
        break;

      default:
        this.visitChildren(node);
    }
  }

  protected visitChildren(node: ts.Node) {
    ts.forEachChild(node, child => this.visitNode(child));
  }
}
