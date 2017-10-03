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
import * as Lint from "tslint";
import * as ts from "typescript";
import { SonarRuleMetaData } from "../sonarRule";

export class Rule extends Lint.Rules.TypedRule {
  public static metadata: SonarRuleMetaData = {
    description: "Return values should not be ignored when function calls don't have any side effects",
    options: null,
    optionsDescription: "",
    rationale: Lint.Utils.dedent`When the call to a function doesn't have any side effect,
            what is the point of making the call if the results are ignored?
            In such cases, either the function call is useless and should be dropped,
            or the source code doesn't behave as expected.`,
    rspecKey: "RSPEC-2201",
    ruleName: "no-ignored-return",
    type: "functionality",
    typescriptOnly: false,
  };

  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

class Walker extends Lint.ProgramAwareRuleWalker {
  private static message(methodName: string) {
    if (methodName === "map") {
      return `Consider using "forEach" instead of "map" as its return value is not being used here.`;
    } else {
      return `The return value of "${methodName}" must be used.`;
    }
  }

  private METHODS_WITHOUT_SIDE_EFFECTS: { [index: string]: Set<string> } = {
    array: new Set([
      "concat",
      "includes",
      "join",
      "slice",
      "indexOf",
      "lastIndexOf",
      "entries",
      "every",
      "some",
      "filter",
      "findIndex",
      "keys",
      "map",
      "values",
      "find",
      "reduce",
      "reduceRight",
      "toString",
      "toLocaleString",
    ]),
    date: new Set([
      "getDate",
      "getDay",
      "getFullYear",
      "getHours",
      "getMilliseconds",
      "getMinutes",
      "getMonth",
      "getSeconds",
      "getTime",
      "getTimezoneOffset",
      "getUTCDate",
      "getUTCDay",
      "getUTCFullYear",
      "getUTCHours",
      "getUTCMilliseconds",
      "getUTCMinutes",
      "getUTCMonth",
      "getUTCSeconds",
      "getYear",
      "toDateString",
      "toISOString",
      "toJSON",
      "toGMTString",
      "toLocaleDateString",
      "toLocaleTimeString",
      "toTimeString",
      "toUTCString",
      "toString",
      "toLocaleString",
    ]),
    math: new Set([
      "abs",
      "E",
      "LN2",
      "LN10",
      "LOG2E",
      "LOG10E",
      "PI",
      "SQRT1_2",
      "SQRT2",
      "abs",
      "acos",
      "acosh",
      "asin",
      "asinh",
      "atan",
      "atanh",
      "atan2",
      "cbrt",
      "ceil",
      "clz32",
      "cos",
      "cosh",
      "exp",
      "expm1",
      "floor",
      "fround",
      "hypot",
      "imul",
      "log",
      "log1p",
      "log10",
      "log2",
      "max",
      "min",
      "pow",
      "random",
      "round",
      "sign",
      "sin",
      "sinh",
      "sqrt",
      "tan",
      "tanh",
      "trunc",
    ]),
    number: new Set(["toExponential", "toFixed", "toPrecision", "toLocaleString", "toString"]),
    regexp: new Set(["test", "toString"]),
    string: new Set([
      "charAt",
      "charCodeAt",
      "codePointAt",
      "concat",
      "includes",
      "endsWith",
      "indexOf",
      "lastIndexOf",
      "localeCompare",
      "match",
      "normalize",
      "padEnd",
      "padStart",
      "repeat",
      "replace",
      "search",
      "slice",
      "split",
      "startsWith",
      "substr",
      "substring",
      "toLocaleLowerCase",
      "toLocaleUpperCase",
      "toLowerCase",
      "toUpperCase",
      "trim",
      "length",
      "toString",
      "valueOf",

      // HTML wrapper methods
      "anchor",
      "big",
      "blink",
      "bold",
      "fixed",
      "fontcolor",
      "fontsize",
      "italics",
      "link",
      "small",
      "strike",
      "sub",
      "sup",
    ]),
  };

  public visitCallExpression(node: ts.CallExpression) {
    if (
      node.expression.kind === ts.SyntaxKind.PropertyAccessExpression &&
      node.parent &&
      node.parent.kind === ts.SyntaxKind.ExpressionStatement
    ) {
      const propertyAccess = node.expression as ts.PropertyAccessExpression;
      const methodName = propertyAccess.name.text;
      const object = propertyAccess.expression;
      const objectType = this.getTypeChecker().getTypeAtLocation(object);

      if (
        this.methodWithNoSideEffect(objectType, methodName) &&
        !this.isReplaceWithCallBack(methodName, node.arguments)
      ) {
        this.addFailureAtNode(node, Walker.message(methodName));
      }
    }

    super.visitCallExpression(node);
  }

  private methodWithNoSideEffect(objectType: ts.Type, methodName: string): boolean {
    const typeAsString = this.typeToString(objectType);
    if (typeAsString !== null) {
      const methods = this.METHODS_WITHOUT_SIDE_EFFECTS[typeAsString];
      return methods && methods.has(methodName);
    }
    return false;
  }

  private typeToString(type: ts.Type): string | null {
    const baseType = this.getTypeChecker().getBaseTypeOfLiteralType(type);
    const typeAsString = this.getTypeChecker().typeToString(baseType);
    if (typeAsString === "number" || typeAsString === "string") {
      return typeAsString;
    }

    const symbol = type.getSymbol();
    if (symbol) {
      const name = symbol.getName();
      switch (name) {
        case "Array":
        case "Date":
        case "Math":
        case "RegExp":
          return name.toLowerCase();
      }
    }

    return null;
  }

  private isReplaceWithCallBack(methodName: string, callArguments: ts.NodeArray<ts.Expression>): boolean {
    if (methodName === "replace" && callArguments.length > 1) {
      const secondArgumentKind = callArguments[1].kind;
      return (
        secondArgumentKind === ts.SyntaxKind.ArrowFunction || secondArgumentKind === ts.SyntaxKind.FunctionExpression
      );
    }

    return false;
  }
}
