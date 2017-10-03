/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {AbstractEmitterVisitor, CATCH_ERROR_VAR, CATCH_STACK_VAR, EmitterVisitorContext} from './abstract_emitter';
import * as o from './output_ast';

export abstract class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
  constructor() { super(false); }
  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any {
    ctx.pushClass(stmt);
    this._visitClassConstructor(stmt, ctx);

    if (stmt.parent != null) {
      ctx.print(stmt, `${stmt.name}.prototype = Object.create(`);
      stmt.parent.visitExpression(this, ctx);
      ctx.println(stmt, `.prototype);`);
    }
    stmt.getters.forEach((getter) => this._visitClassGetter(stmt, getter, ctx));
    stmt.methods.forEach((method) => this._visitClassMethod(stmt, method, ctx));
    ctx.popClass();
    return null;
  }

  private _visitClassConstructor(stmt: o.ClassStmt, ctx: EmitterVisitorContext) {
    ctx.print(stmt, `function ${stmt.name}(`);
    if (stmt.constructorMethod != null) {
      this._visitParams(stmt.constructorMethod.params, ctx);
    }
    ctx.println(stmt, `) {`);
    ctx.incIndent();
    if (stmt.constructorMethod != null) {
      if (stmt.constructorMethod.body.length > 0) {
        ctx.println(stmt, `var self = this;`);
        this.visitAllStatements(stmt.constructorMethod.body, ctx);
      }
    }
    ctx.decIndent();
    ctx.println(stmt, `}`);
  }

  private _visitClassGetter(stmt: o.ClassStmt, getter: o.ClassGetter, ctx: EmitterVisitorContext) {
    ctx.println(
        stmt,
        `Object.defineProperty(${stmt.name}.prototype, '${getter.name}', { get: function() {`);
    ctx.incIndent();
    if (getter.body.length > 0) {
      ctx.println(stmt, `var self = this;`);
      this.visitAllStatements(getter.body, ctx);
    }
    ctx.decIndent();
    ctx.println(stmt, `}});`);
  }

  private _visitClassMethod(stmt: o.ClassStmt, method: o.ClassMethod, ctx: EmitterVisitorContext) {
    ctx.print(stmt, `${stmt.name}.prototype.${method.name} = function(`);
    this._visitParams(method.params, ctx);
    ctx.println(stmt, `) {`);
    ctx.incIndent();
    if (method.body.length > 0) {
      ctx.println(stmt, `var self = this;`);
      this.visitAllStatements(method.body, ctx);
    }
    ctx.decIndent();
    ctx.println(stmt, `};`);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): string|null {
    if (ast.builtin === o.BuiltinVar.This) {
      ctx.print(ast, 'self');
    } else if (ast.builtin === o.BuiltinVar.Super) {
      throw new Error(
          `'super' needs to be handled at a parent ast node, not at the variable level!`);
    } else {
      super.visitReadVarExpr(ast, ctx);
    }
    return null;
  }
  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    ctx.print(stmt, `var ${stmt.name} = `);
    stmt.value.visitExpression(this, ctx);
    ctx.println(stmt, `;`);
    return null;
  }
  visitCastExpr(ast: o.CastExpr, ctx: EmitterVisitorContext): any {
    ast.value.visitExpression(this, ctx);
    return null;
  }
  visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): string|null {
    const fnExpr = expr.fn;
    if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
      ctx.currentClass !.parent !.visitExpression(this, ctx);
      ctx.print(expr, `.call(this`);
      if (expr.args.length > 0) {
        ctx.print(expr, `, `);
        this.visitAllExpressions(expr.args, ctx, ',');
      }
      ctx.print(expr, `)`);
    } else {
      super.visitInvokeFunctionExpr(expr, ctx);
    }
    return null;
  }
  visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any {
    ctx.print(ast, `function(`);
    this._visitParams(ast.params, ctx);
    ctx.println(ast, `) {`);
    ctx.incIndent();
    this.visitAllStatements(ast.statements, ctx);
    ctx.decIndent();
    ctx.print(ast, `}`);
    return null;
  }
  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any {
    ctx.print(stmt, `function ${stmt.name}(`);
    this._visitParams(stmt.params, ctx);
    ctx.println(stmt, `) {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.statements, ctx);
    ctx.decIndent();
    ctx.println(stmt, `}`);
    return null;
  }
  visitTryCatchStmt(stmt: o.TryCatchStmt, ctx: EmitterVisitorContext): any {
    ctx.println(stmt, `try {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.bodyStmts, ctx);
    ctx.decIndent();
    ctx.println(stmt, `} catch (${CATCH_ERROR_VAR.name}) {`);
    ctx.incIndent();
    const catchStmts =
        [<o.Statement>CATCH_STACK_VAR.set(CATCH_ERROR_VAR.prop('stack')).toDeclStmt(null, [
          o.StmtModifier.Final
        ])].concat(stmt.catchStmts);
    this.visitAllStatements(catchStmts, ctx);
    ctx.decIndent();
    ctx.println(stmt, `}`);
    return null;
  }

  private _visitParams(params: o.FnParam[], ctx: EmitterVisitorContext): void {
    this.visitAllObjects(param => ctx.print(null, param.name), params, ctx, ',');
  }

  getBuiltinMethodName(method: o.BuiltinMethod): string {
    let name: string;
    switch (method) {
      case o.BuiltinMethod.ConcatArray:
        name = 'concat';
        break;
      case o.BuiltinMethod.SubscribeObservable:
        name = 'subscribe';
        break;
      case o.BuiltinMethod.Bind:
        name = 'bind';
        break;
      default:
        throw new Error(`Unknown builtin method: ${method}`);
    }
    return name;
  }
}
