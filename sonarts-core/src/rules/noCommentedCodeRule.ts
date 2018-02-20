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
import { SonarRuleVisitor, IssueLocation } from "../utils/sonarAnalysis";
import { toTokens, lineAndCharacterByPos, getText, getCommentsBefore, getCommentsAfter } from "../utils/navigation";
import * as nodes from "../utils/nodes";

export class Rule extends tslint.Rules.AbstractRule {
  public static metadata: SonarRuleMetaData = {
    ruleName: "no-commented-code",
    description: 'Sections of code should not be "commented out"',
    rationale: tslint.Utils.dedent`
      Programmers should not comment out code as it bloats programs and reduces readability. Unused code should 
      be deleted and can be retrieved from source control history if required.`,
    optionsDescription: "",
    options: null,
    rspecKey: "RSPEC-125",
    type: "functionality",
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): tslint.RuleFailure[] {
    return new Visitor(this.getOptions().ruleName).visit(sourceFile).getIssues();
  }
}

interface SourceFileWithDiagnostics extends ts.SourceFile {
  parseDiagnostics: ts.Diagnostic[];
}

class Visitor extends SonarRuleVisitor {
  sourceFile: ts.SourceFile;

  protected visitSourceFile(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
    const tokens = toTokens(sourceFile);
    tokens.forEach(token => {
      this.processComments(getCommentsBefore(token));
      this.processComments(getCommentsAfter(token));
    });
  }

  private processComments(comments: ts.CommentRange[]) {
    const groupedComments = this.groupComments(comments);

    groupedComments.forEach(group => {
      let text = this.getCommentGroupText(group);
      if (!this.isRawExclusion(text)) {
        text = this.injectMissingBraces(text);
        const parsed = this.tryToParse(text);
        if (parsed.parseDiagnostics.length === 0 && parsed.statements.length > 0 && !this.isExclusion(parsed)) {
          this.addIssueAtLocation(
            new IssueLocation(
              group[0].pos,
              group[group.length - 1].end,
              this.sourceFile,
              `Remove this commented out code.`,
            ),
          );
        }
      }
    });
  }

  private groupComments(comments: ts.CommentRange[]) {
    const groups: ts.CommentRange[][] = [];
    let currentGroup: ts.CommentRange[] | undefined;

    for (const comment of comments) {
      if (this.isLintComment(comment)) {
        continue;
      }
      if (!currentGroup) {
        currentGroup = [comment];
      } else if (this.isAdjacent(comment, currentGroup)) {
        currentGroup.push(comment);
      } else {
        groups.push(currentGroup);
        currentGroup = [comment];
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private isAdjacent(comment: ts.CommentRange, currentGroup: ts.CommentRange[]) {
    const groupLine = lineAndCharacterByPos(currentGroup[currentGroup.length - 1].end, this.sourceFile).line;
    const commentLine = lineAndCharacterByPos(comment.pos, this.sourceFile).line;
    return groupLine + 1 === commentLine;
  }

  private getCommentText(comment: ts.CommentRange) {
    return getText(comment, this.sourceFile);
  }

  private getCommentGroupText(group: ts.CommentRange[]) {
    let results = "";
    group.forEach(comment => {
      const text = this.uncomment(this.getCommentText(comment));
      results += "\n";
      results += text;
    });
    return results.trim();
  }

  private uncomment(comment: string) {
    if (comment.startsWith("//")) {
      return comment.substring(2);
    } else if (comment.startsWith("/*")) {
      return comment.substring(2, comment.length - 2);
    } else if (comment.startsWith("<!--")) {
      return comment.endsWith("-->") ? comment.substring(4, comment.length - 3) : comment.substring(4);
    } else {
      return comment;
    }
  }

  private injectMissingBraces(uncommentedText: string) {
    const openCurlyBraceNum = (uncommentedText.match(/{/g) || []).length;
    const closeCurlyBraceNum = (uncommentedText.match(/}/g) || []).length;
    return openCurlyBraceNum > closeCurlyBraceNum
      ? uncommentedText + "}".repeat(openCurlyBraceNum - closeCurlyBraceNum)
      : "{".repeat(closeCurlyBraceNum - openCurlyBraceNum) + uncommentedText;
  }

  private tryToParse(text: string) {
    return ts.createSourceFile("", text, ts.ScriptTarget.Latest, true) as SourceFileWithDiagnostics;
  }

  private isRawExclusion(uncommentedText: string) {
    const trimmed = uncommentedText.trim();
    return [";", "{", "}"].includes(trimmed);
  }

  private isExclusion({ statements }: ts.SourceFile) {
    return (
      statements.every(node => nodes.isExpressionStatement(node) && nodes.isIdentifier(node.expression)) ||
      (statements.length === 1 &&
        (nodes.isLabeledStatement(statements[0]) ||
          nodes.isBreakStatement(statements[0]) ||
          nodes.isContinueStatement(statements[0]) ||
          this.isExpressionExclusion(statements[0]) ||
          this.isReturnThrowExclusion(statements[0])))
    );
  }

  /** Excludes `foo`, `foo, bar`, `"foo"`, `42` and `+42` expressions */
  private isExpressionExclusion(node: ts.Node) {
    return (
      nodes.isExpressionStatement(node) &&
      (!node.getText().endsWith(";") ||
        (nodes.isBinaryExpression(node.expression) &&
          nodes.is(node.expression.operatorToken, ts.SyntaxKind.CommaToken)) ||
        nodes.isIdentifier(node.expression) ||
        nodes.isStringLiteral(node.expression) ||
        nodes.isNumericLiteral(node.expression) ||
        nodes.isPrefixUnaryExpression(node.expression))
    );
  }

  /** Excludes `return`, `return foo`, `throw` and `throw foo` statements */
  private isReturnThrowExclusion(node: ts.Node) {
    return (
      (nodes.isReturnStatement(node) || nodes.isThrowStatement(node)) &&
      (!!node.expression && nodes.isIdentifier(node.expression))
    );
  }

  private isLintComment(comment: ts.CommentRange) {
    const text = this.getCommentText(comment);
    return Boolean(text.match(/^\/\*\s+tslint/));
  }
}
