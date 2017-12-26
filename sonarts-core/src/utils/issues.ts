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
import { lineAndCharacter } from "./navigation";
import { toSonarLine } from "../runner/sonar-utils";
import { TreeVisitor } from "./visitor";
import * as tslint from "tslint";

export abstract class SonarRule extends tslint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
    return convertToTslintFailures(this.applyWithSonar(sourceFile, program));
  }

  public analyze(sourceFile: ts.SourceFile, program: ts.Program, VisitorClass: typeof SonarRuleVisitor): SonarIssue[] {
    const visitor = new VisitorClass(this.getOptions().ruleName, program);
    visitor.visit(sourceFile);
    return visitor.getIssues();
  }

  public applyWithSonar(sourceFile: ts.SourceFile, program: ts.Program): SonarIssue[] {
    return this.analyze(sourceFile, program, this.ruleVisitor());
  }

  abstract ruleVisitor(): typeof SonarRuleVisitor;
}

function convertToTslintFailures(issues: SonarIssue[]): tslint.RuleFailure[] {
  return issues.map(issue => {
    const node = issue.primaryLocation.getNode();
    return new tslint.RuleFailure(
      node.getSourceFile(),
      node.getStart(),
      node.getEnd(),
      issue.primaryLocation.getMessage()!,
      issue.ruleName,
    );
  });
}

export class SonarRuleVisitor extends TreeVisitor {
  private issues: SonarIssue[] = [];

  public constructor(private ruleName: string, protected program: ts.Program) {
    super();
  }

  public getIssues() {
    return this.issues;
  }

  public addIssue(node: ts.Node, message: string): SonarIssue {
    const issue = new SonarIssue(new IssueLocation(node, message), this.ruleName);
    this.issues.push(issue);
    return issue;
  }
}

export class IssueLocation {
  private node: ts.Node;
  private message?: string;

  public readonly startLine: number;
  public readonly startColumn: number;
  public readonly endLine: number;
  public readonly endColumn: number;

  public constructor(node: ts.Node, message?: string, lastNode: ts.Node = node) {
    this.node = node;
    this.message = message;

    const startPosition = lineAndCharacter(node.getStart(), node.getSourceFile());
    const endPosition = lineAndCharacter(lastNode.getEnd(), node.getSourceFile());

    this.startLine = toSonarLine(startPosition.line);
    this.startColumn = startPosition.character;
    this.endLine = toSonarLine(endPosition.line);
    this.endColumn = endPosition.character;
  }

  public getMessage() {
    return this.message;
  }

  public getNode() {
    return this.node;
  }

  public toJson() {
    return {
      startLine: this.startLine,
      startColumn: this.startColumn,
      endLine: this.endLine,
      endColumn: this.endColumn,
    };
  }
}

export class SonarIssue {
  private cost?: number;
  public readonly primaryLocation: IssueLocation;
  public readonly ruleName: string;
  private secondaryLocations: IssueLocation[] = [];

  public constructor(primaryLocation: IssueLocation, ruleName: string) {
    this.primaryLocation = primaryLocation;
    this.ruleName = ruleName;
  }

  public toJson() {
    return {
      failure: this.primaryLocation.getMessage(),
      startPosition: { line: this.primaryLocation.startLine, character: this.primaryLocation.startColumn },
      endPosition: { line: this.primaryLocation.endLine, character: this.primaryLocation.endColumn },
      name: this.primaryLocation.getNode().getSourceFile().fileName,
      ruleName: this.ruleName,
      cost: this.cost,
      secondaryLocation: this.secondaryLocations,
    };
  }

  public setCost(cost: number): SonarIssue {
    this.cost = cost;
    return this;
  }

  public addSecondary(secondaryLocation: IssueLocation): SonarIssue {
    this.secondaryLocations.push(secondaryLocation);
    return this;
  }

  public getStartPosition() {
    return this.primaryLocation.getNode().getStart();
  }
}
