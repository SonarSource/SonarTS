/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as cdAst from '../expression_parser/ast';
import {Identifiers, createIdentifier} from '../identifiers';
import * as o from '../output/output_ast';

export class EventHandlerVars { static event = o.variable('$event'); }

export interface LocalResolver { getLocal(name: string): o.Expression|null; }

export class ConvertActionBindingResult {
  constructor(public stmts: o.Statement[], public allowDefault: o.ReadVarExpr) {}
}

/**
 * Converts the given expression AST into an executable output AST, assuming the expression is
 * used in an action binding (e.g. an event handler).
 */
export function convertActionBinding(
    localResolver: LocalResolver | null, implicitReceiver: o.Expression, action: cdAst.AST,
    bindingId: string): ConvertActionBindingResult {
  if (!localResolver) {
    localResolver = new DefaultLocalResolver();
  }
  const actionWithoutBuiltins = convertPropertyBindingBuiltins(
      {
        createLiteralArrayConverter: (argCount: number) => {
          // Note: no caching for literal arrays in actions.
          return (args: o.Expression[]) => o.literalArr(args);
        },
        createLiteralMapConverter: (keys: string[]) => {
          // Note: no caching for literal maps in actions.
          return (args: o.Expression[]) =>
                     o.literalMap(<[string, o.Expression][]>keys.map((key, i) => [key, args[i]]));
        },
        createPipeConverter: (name: string) => {
          throw new Error(`Illegal State: Actions are not allowed to contain pipes. Pipe: ${name}`);
        }
      },
      action);

  const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId);
  const actionStmts: o.Statement[] = [];
  flattenStatements(actionWithoutBuiltins.visit(visitor, _Mode.Statement), actionStmts);
  prependTemporaryDecls(visitor.temporaryCount, bindingId, actionStmts);
  const lastIndex = actionStmts.length - 1;
  let preventDefaultVar: o.ReadVarExpr = null !;
  if (lastIndex >= 0) {
    const lastStatement = actionStmts[lastIndex];
    const returnExpr = convertStmtIntoExpression(lastStatement);
    if (returnExpr) {
      // Note: We need to cast the result of the method call to dynamic,
      // as it might be a void method!
      preventDefaultVar = createPreventDefaultVar(bindingId);
      actionStmts[lastIndex] =
          preventDefaultVar.set(returnExpr.cast(o.DYNAMIC_TYPE).notIdentical(o.literal(false)))
              .toDeclStmt(null, [o.StmtModifier.Final]);
    }
  }
  return new ConvertActionBindingResult(actionStmts, preventDefaultVar);
}

export interface BuiltinConverter { (args: o.Expression[]): o.Expression; }

export interface BuiltinConverterFactory {
  createLiteralArrayConverter(argCount: number): BuiltinConverter;
  createLiteralMapConverter(keys: string[]): BuiltinConverter;
  createPipeConverter(name: string, argCount: number): BuiltinConverter;
}

export function convertPropertyBindingBuiltins(
    converterFactory: BuiltinConverterFactory, ast: cdAst.AST): cdAst.AST {
  return convertBuiltins(converterFactory, ast);
}

export class ConvertPropertyBindingResult {
  constructor(public stmts: o.Statement[], public currValExpr: o.Expression) {}
}

/**
 * Converts the given expression AST into an executable output AST, assuming the expression
 * is used in property binding. The expression has to be preprocessed via
 * `convertPropertyBindingBuiltins`.
 */
export function convertPropertyBinding(
    localResolver: LocalResolver | null, implicitReceiver: o.Expression,
    expressionWithoutBuiltins: cdAst.AST, bindingId: string): ConvertPropertyBindingResult {
  if (!localResolver) {
    localResolver = new DefaultLocalResolver();
  }
  const currValExpr = createCurrValueExpr(bindingId);
  const stmts: o.Statement[] = [];
  const visitor = new _AstToIrVisitor(localResolver, implicitReceiver, bindingId);
  const outputExpr: o.Expression = expressionWithoutBuiltins.visit(visitor, _Mode.Expression);

  if (visitor.temporaryCount) {
    for (let i = 0; i < visitor.temporaryCount; i++) {
      stmts.push(temporaryDeclaration(bindingId, i));
    }
  }

  stmts.push(currValExpr.set(outputExpr).toDeclStmt(null, [o.StmtModifier.Final]));
  return new ConvertPropertyBindingResult(stmts, currValExpr);
}

function convertBuiltins(converterFactory: BuiltinConverterFactory, ast: cdAst.AST): cdAst.AST {
  const visitor = new _BuiltinAstConverter(converterFactory);
  return ast.visit(visitor);
}

function temporaryName(bindingId: string, temporaryNumber: number): string {
  return `tmp_${bindingId}_${temporaryNumber}`;
}

export function temporaryDeclaration(bindingId: string, temporaryNumber: number): o.Statement {
  return new o.DeclareVarStmt(temporaryName(bindingId, temporaryNumber), o.NULL_EXPR);
}

function prependTemporaryDecls(
    temporaryCount: number, bindingId: string, statements: o.Statement[]) {
  for (let i = temporaryCount - 1; i >= 0; i--) {
    statements.unshift(temporaryDeclaration(bindingId, i));
  }
}

enum _Mode {
  Statement,
  Expression
}

function ensureStatementMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Statement) {
    throw new Error(`Expected a statement, but saw ${ast}`);
  }
}

function ensureExpressionMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Expression) {
    throw new Error(`Expected an expression, but saw ${ast}`);
  }
}

function convertToStatementIfNeeded(mode: _Mode, expr: o.Expression): o.Expression|o.Statement {
  if (mode === _Mode.Statement) {
    return expr.toStmt();
  } else {
    return expr;
  }
}

class _BuiltinAstConverter extends cdAst.AstTransformer {
  constructor(private _converterFactory: BuiltinConverterFactory) { super(); }
  visitPipe(ast: cdAst.BindingPipe, context: any): any {
    const args = [ast.exp, ...ast.args].map(ast => ast.visit(this, context));
    return new BuiltinFunctionCall(
        ast.span, args, this._converterFactory.createPipeConverter(ast.name, args.length));
  }
  visitLiteralArray(ast: cdAst.LiteralArray, context: any): any {
    const args = ast.expressions.map(ast => ast.visit(this, context));
    return new BuiltinFunctionCall(
        ast.span, args, this._converterFactory.createLiteralArrayConverter(ast.expressions.length));
  }
  visitLiteralMap(ast: cdAst.LiteralMap, context: any): any {
    const args = ast.values.map(ast => ast.visit(this, context));
    return new BuiltinFunctionCall(
        ast.span, args, this._converterFactory.createLiteralMapConverter(ast.keys));
  }
}

class _AstToIrVisitor implements cdAst.AstVisitor {
  private _nodeMap = new Map<cdAst.AST, cdAst.AST>();
  private _resultMap = new Map<cdAst.AST, o.Expression>();
  private _currentTemporary: number = 0;
  public temporaryCount: number = 0;

  constructor(
      private _localResolver: LocalResolver, private _implicitReceiver: o.Expression,
      private bindingId: string) {}

  visitBinary(ast: cdAst.Binary, mode: _Mode): any {
    let op: o.BinaryOperator;
    switch (ast.operation) {
      case '+':
        op = o.BinaryOperator.Plus;
        break;
      case '-':
        op = o.BinaryOperator.Minus;
        break;
      case '*':
        op = o.BinaryOperator.Multiply;
        break;
      case '/':
        op = o.BinaryOperator.Divide;
        break;
      case '%':
        op = o.BinaryOperator.Modulo;
        break;
      case '&&':
        op = o.BinaryOperator.And;
        break;
      case '||':
        op = o.BinaryOperator.Or;
        break;
      case '==':
        op = o.BinaryOperator.Equals;
        break;
      case '!=':
        op = o.BinaryOperator.NotEquals;
        break;
      case '===':
        op = o.BinaryOperator.Identical;
        break;
      case '!==':
        op = o.BinaryOperator.NotIdentical;
        break;
      case '<':
        op = o.BinaryOperator.Lower;
        break;
      case '>':
        op = o.BinaryOperator.Bigger;
        break;
      case '<=':
        op = o.BinaryOperator.LowerEquals;
        break;
      case '>=':
        op = o.BinaryOperator.BiggerEquals;
        break;
      default:
        throw new Error(`Unsupported operation ${ast.operation}`);
    }

    return convertToStatementIfNeeded(
        mode,
        new o.BinaryOperatorExpr(
            op, this._visit(ast.left, _Mode.Expression), this._visit(ast.right, _Mode.Expression)));
  }

  visitChain(ast: cdAst.Chain, mode: _Mode): any {
    ensureStatementMode(mode, ast);
    return this.visitAll(ast.expressions, mode);
  }

  visitConditional(ast: cdAst.Conditional, mode: _Mode): any {
    const value: o.Expression = this._visit(ast.condition, _Mode.Expression);
    return convertToStatementIfNeeded(
        mode, value.conditional(
                  this._visit(ast.trueExp, _Mode.Expression),
                  this._visit(ast.falseExp, _Mode.Expression)));
  }

  visitPipe(ast: cdAst.BindingPipe, mode: _Mode): any {
    throw new Error(
        `Illegal state: Pipes should have been converted into functions. Pipe: ${ast.name}`);
  }

  visitFunctionCall(ast: cdAst.FunctionCall, mode: _Mode): any {
    const convertedArgs = this.visitAll(ast.args, _Mode.Expression);
    let fnResult: o.Expression;
    if (ast instanceof BuiltinFunctionCall) {
      fnResult = ast.converter(convertedArgs);
    } else {
      fnResult = this._visit(ast.target !, _Mode.Expression).callFn(convertedArgs);
    }
    return convertToStatementIfNeeded(mode, fnResult);
  }

  visitImplicitReceiver(ast: cdAst.ImplicitReceiver, mode: _Mode): any {
    ensureExpressionMode(mode, ast);
    return this._implicitReceiver;
  }

  visitInterpolation(ast: cdAst.Interpolation, mode: _Mode): any {
    ensureExpressionMode(mode, ast);
    const args = [o.literal(ast.expressions.length)];
    for (let i = 0; i < ast.strings.length - 1; i++) {
      args.push(o.literal(ast.strings[i]));
      args.push(this._visit(ast.expressions[i], _Mode.Expression));
    }
    args.push(o.literal(ast.strings[ast.strings.length - 1]));

    return ast.expressions.length <= 9 ?
        o.importExpr(createIdentifier(Identifiers.inlineInterpolate)).callFn(args) :
        o.importExpr(createIdentifier(Identifiers.interpolate)).callFn([
          args[0], o.literalArr(args.slice(1))
        ]);
  }

  visitKeyedRead(ast: cdAst.KeyedRead, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      return convertToStatementIfNeeded(
          mode, this._visit(ast.obj, _Mode.Expression).key(this._visit(ast.key, _Mode.Expression)));
    }
  }

  visitKeyedWrite(ast: cdAst.KeyedWrite, mode: _Mode): any {
    const obj: o.Expression = this._visit(ast.obj, _Mode.Expression);
    const key: o.Expression = this._visit(ast.key, _Mode.Expression);
    const value: o.Expression = this._visit(ast.value, _Mode.Expression);
    return convertToStatementIfNeeded(mode, obj.key(key).set(value));
  }

  visitLiteralArray(ast: cdAst.LiteralArray, mode: _Mode): any {
    throw new Error(`Illegal State: literal arrays should have been converted into functions`);
  }

  visitLiteralMap(ast: cdAst.LiteralMap, mode: _Mode): any {
    throw new Error(`Illegal State: literal maps should have been converted into functions`);
  }

  visitLiteralPrimitive(ast: cdAst.LiteralPrimitive, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, o.literal(ast.value));
  }

  private _getLocal(name: string): o.Expression|null { return this._localResolver.getLocal(name); }

  visitMethodCall(ast: cdAst.MethodCall, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      const args = this.visitAll(ast.args, _Mode.Expression);
      let result: any = null;
      const receiver = this._visit(ast.receiver, _Mode.Expression);
      if (receiver === this._implicitReceiver) {
        const varExpr = this._getLocal(ast.name);
        if (varExpr) {
          result = varExpr.callFn(args);
        }
      }
      if (result == null) {
        result = receiver.callMethod(ast.name, args);
      }
      return convertToStatementIfNeeded(mode, result);
    }
  }

  visitPrefixNot(ast: cdAst.PrefixNot, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, o.not(this._visit(ast.expression, _Mode.Expression)));
  }

  visitNonNullAssert(ast: cdAst.NonNullAssert, mode: _Mode): any {
    return convertToStatementIfNeeded(
        mode, o.assertNotNull(this._visit(ast.expression, _Mode.Expression)));
  }

  visitPropertyRead(ast: cdAst.PropertyRead, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      let result: any = null;
      const receiver = this._visit(ast.receiver, _Mode.Expression);
      if (receiver === this._implicitReceiver) {
        result = this._getLocal(ast.name);
      }
      if (result == null) {
        result = receiver.prop(ast.name);
      }
      return convertToStatementIfNeeded(mode, result);
    }
  }

  visitPropertyWrite(ast: cdAst.PropertyWrite, mode: _Mode): any {
    const receiver: o.Expression = this._visit(ast.receiver, _Mode.Expression);
    if (receiver === this._implicitReceiver) {
      const varExpr = this._getLocal(ast.name);
      if (varExpr) {
        throw new Error('Cannot assign to a reference or variable!');
      }
    }
    return convertToStatementIfNeeded(
        mode, receiver.prop(ast.name).set(this._visit(ast.value, _Mode.Expression)));
  }

  visitSafePropertyRead(ast: cdAst.SafePropertyRead, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }

  visitSafeMethodCall(ast: cdAst.SafeMethodCall, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }

  visitAll(asts: cdAst.AST[], mode: _Mode): any { return asts.map(ast => this._visit(ast, mode)); }

  visitQuote(ast: cdAst.Quote, mode: _Mode): any {
    throw new Error(`Quotes are not supported for evaluation!
        Statement: ${ast.uninterpretedExpression} located at ${ast.location}`);
  }

  private _visit(ast: cdAst.AST, mode: _Mode): any {
    const result = this._resultMap.get(ast);
    if (result) return result;
    return (this._nodeMap.get(ast) || ast).visit(this, mode);
  }

  private convertSafeAccess(
      ast: cdAst.AST, leftMostSafe: cdAst.SafeMethodCall|cdAst.SafePropertyRead, mode: _Mode): any {
    // If the expression contains a safe access node on the left it needs to be converted to
    // an expression that guards the access to the member by checking the receiver for blank. As
    // execution proceeds from left to right, the left most part of the expression must be guarded
    // first but, because member access is left associative, the right side of the expression is at
    // the top of the AST. The desired result requires lifting a copy of the the left part of the
    // expression up to test it for blank before generating the unguarded version.

    // Consider, for example the following expression: a?.b.c?.d.e

    // This results in the ast:
    //         .
    //        / \
    //       ?.   e
    //      /  \
    //     .    d
    //    / \
    //   ?.  c
    //  /  \
    // a    b

    // The following tree should be generated:
    //
    //        /---- ? ----\
    //       /      |      \
    //     a   /--- ? ---\  null
    //        /     |     \
    //       .      .     null
    //      / \    / \
    //     .  c   .   e
    //    / \    / \
    //   a   b  ,   d
    //         / \
    //        .   c
    //       / \
    //      a   b
    //
    // Notice that the first guard condition is the left hand of the left most safe access node
    // which comes in as leftMostSafe to this routine.

    let guardedExpression = this._visit(leftMostSafe.receiver, _Mode.Expression);
    let temporary: o.ReadVarExpr = undefined !;
    if (this.needsTemporary(leftMostSafe.receiver)) {
      // If the expression has method calls or pipes then we need to save the result into a
      // temporary variable to avoid calling stateful or impure code more than once.
      temporary = this.allocateTemporary();

      // Preserve the result in the temporary variable
      guardedExpression = temporary.set(guardedExpression);

      // Ensure all further references to the guarded expression refer to the temporary instead.
      this._resultMap.set(leftMostSafe.receiver, temporary);
    }
    const condition = guardedExpression.isBlank();

    // Convert the ast to an unguarded access to the receiver's member. The map will substitute
    // leftMostNode with its unguarded version in the call to `this.visit()`.
    if (leftMostSafe instanceof cdAst.SafeMethodCall) {
      this._nodeMap.set(
          leftMostSafe,
          new cdAst.MethodCall(
              leftMostSafe.span, leftMostSafe.receiver, leftMostSafe.name, leftMostSafe.args));
    } else {
      this._nodeMap.set(
          leftMostSafe,
          new cdAst.PropertyRead(leftMostSafe.span, leftMostSafe.receiver, leftMostSafe.name));
    }

    // Recursively convert the node now without the guarded member access.
    const access = this._visit(ast, _Mode.Expression);

    // Remove the mapping. This is not strictly required as the converter only traverses each node
    // once but is safer if the conversion is changed to traverse the nodes more than once.
    this._nodeMap.delete(leftMostSafe);

    // If we allocated a temporary, release it.
    if (temporary) {
      this.releaseTemporary(temporary);
    }

    // Produce the conditional
    return convertToStatementIfNeeded(mode, condition.conditional(o.literal(null), access));
  }

  // Given a expression of the form a?.b.c?.d.e the the left most safe node is
  // the (a?.b). The . and ?. are left associative thus can be rewritten as:
  // ((((a?.c).b).c)?.d).e. This returns the most deeply nested safe read or
  // safe method call as this needs be transform initially to:
  //   a == null ? null : a.c.b.c?.d.e
  // then to:
  //   a == null ? null : a.b.c == null ? null : a.b.c.d.e
  private leftMostSafeNode(ast: cdAst.AST): cdAst.SafePropertyRead|cdAst.SafeMethodCall {
    const visit = (visitor: cdAst.AstVisitor, ast: cdAst.AST): any => {
      return (this._nodeMap.get(ast) || ast).visit(visitor);
    };
    return ast.visit({
      visitBinary(ast: cdAst.Binary) { return null; },
      visitChain(ast: cdAst.Chain) { return null; },
      visitConditional(ast: cdAst.Conditional) { return null; },
      visitFunctionCall(ast: cdAst.FunctionCall) { return null; },
      visitImplicitReceiver(ast: cdAst.ImplicitReceiver) { return null; },
      visitInterpolation(ast: cdAst.Interpolation) { return null; },
      visitKeyedRead(ast: cdAst.KeyedRead) { return visit(this, ast.obj); },
      visitKeyedWrite(ast: cdAst.KeyedWrite) { return null; },
      visitLiteralArray(ast: cdAst.LiteralArray) { return null; },
      visitLiteralMap(ast: cdAst.LiteralMap) { return null; },
      visitLiteralPrimitive(ast: cdAst.LiteralPrimitive) { return null; },
      visitMethodCall(ast: cdAst.MethodCall) { return visit(this, ast.receiver); },
      visitPipe(ast: cdAst.BindingPipe) { return null; },
      visitPrefixNot(ast: cdAst.PrefixNot) { return null; },
      visitNonNullAssert(ast: cdAst.NonNullAssert) { return null; },
      visitPropertyRead(ast: cdAst.PropertyRead) { return visit(this, ast.receiver); },
      visitPropertyWrite(ast: cdAst.PropertyWrite) { return null; },
      visitQuote(ast: cdAst.Quote) { return null; },
      visitSafeMethodCall(ast: cdAst.SafeMethodCall) { return visit(this, ast.receiver) || ast; },
      visitSafePropertyRead(ast: cdAst.SafePropertyRead) {
        return visit(this, ast.receiver) || ast;
      }
    });
  }

  // Returns true of the AST includes a method or a pipe indicating that, if the
  // expression is used as the target of a safe property or method access then
  // the expression should be stored into a temporary variable.
  private needsTemporary(ast: cdAst.AST): boolean {
    const visit = (visitor: cdAst.AstVisitor, ast: cdAst.AST): boolean => {
      return ast && (this._nodeMap.get(ast) || ast).visit(visitor);
    };
    const visitSome = (visitor: cdAst.AstVisitor, ast: cdAst.AST[]): boolean => {
      return ast.some(ast => visit(visitor, ast));
    };
    return ast.visit({
      visitBinary(ast: cdAst.Binary):
          boolean{return visit(this, ast.left) || visit(this, ast.right);},
      visitChain(ast: cdAst.Chain) { return false; },
      visitConditional(ast: cdAst.Conditional):
          boolean{return visit(this, ast.condition) || visit(this, ast.trueExp) ||
                      visit(this, ast.falseExp);},
      visitFunctionCall(ast: cdAst.FunctionCall) { return true; },
      visitImplicitReceiver(ast: cdAst.ImplicitReceiver) { return false; },
      visitInterpolation(ast: cdAst.Interpolation) { return visitSome(this, ast.expressions); },
      visitKeyedRead(ast: cdAst.KeyedRead) { return false; },
      visitKeyedWrite(ast: cdAst.KeyedWrite) { return false; },
      visitLiteralArray(ast: cdAst.LiteralArray) { return true; },
      visitLiteralMap(ast: cdAst.LiteralMap) { return true; },
      visitLiteralPrimitive(ast: cdAst.LiteralPrimitive) { return false; },
      visitMethodCall(ast: cdAst.MethodCall) { return true; },
      visitPipe(ast: cdAst.BindingPipe) { return true; },
      visitPrefixNot(ast: cdAst.PrefixNot) { return visit(this, ast.expression); },
      visitNonNullAssert(ast: cdAst.PrefixNot) { return visit(this, ast.expression); },
      visitPropertyRead(ast: cdAst.PropertyRead) { return false; },
      visitPropertyWrite(ast: cdAst.PropertyWrite) { return false; },
      visitQuote(ast: cdAst.Quote) { return false; },
      visitSafeMethodCall(ast: cdAst.SafeMethodCall) { return true; },
      visitSafePropertyRead(ast: cdAst.SafePropertyRead) { return false; }
    });
  }

  private allocateTemporary(): o.ReadVarExpr {
    const tempNumber = this._currentTemporary++;
    this.temporaryCount = Math.max(this._currentTemporary, this.temporaryCount);
    return new o.ReadVarExpr(temporaryName(this.bindingId, tempNumber));
  }

  private releaseTemporary(temporary: o.ReadVarExpr) {
    this._currentTemporary--;
    if (temporary.name != temporaryName(this.bindingId, this._currentTemporary)) {
      throw new Error(`Temporary ${temporary.name} released out of order`);
    }
  }
}

function flattenStatements(arg: any, output: o.Statement[]) {
  if (Array.isArray(arg)) {
    (<any[]>arg).forEach((entry) => flattenStatements(entry, output));
  } else {
    output.push(arg);
  }
}

class DefaultLocalResolver implements LocalResolver {
  getLocal(name: string): o.Expression|null {
    if (name === EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    return null;
  }
}

function createCurrValueExpr(bindingId: string): o.ReadVarExpr {
  return o.variable(`currVal_${bindingId}`);  // fix syntax highlighting: `
}

function createPreventDefaultVar(bindingId: string): o.ReadVarExpr {
  return o.variable(`pd_${bindingId}`);
}

function convertStmtIntoExpression(stmt: o.Statement): o.Expression|null {
  if (stmt instanceof o.ExpressionStatement) {
    return stmt.expr;
  } else if (stmt instanceof o.ReturnStatement) {
    return stmt.value;
  }
  return null;
}

class BuiltinFunctionCall extends cdAst.FunctionCall {
  constructor(span: cdAst.ParseSpan, public args: cdAst.AST[], public converter: BuiltinConverter) {
    super(span, null, args);
  }
}
