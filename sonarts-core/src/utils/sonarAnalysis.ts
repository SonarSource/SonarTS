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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import * as ts from "typescript";
import { lineAndCharacter } from "./navigation";
import { TreeVisitor } from "./visitor";
import * as tslint from "tslint";

export class SonarRuleVisitor extends TreeVisitor {
  private issues: SonarIssue[] = [];

  public constructor(private ruleName: string) {
    super();
  }

  public getIssues(): tslint.RuleFailure[] {
    return this.issues;
  }

  public addIssue(node: ts.Node, message: string): SonarIssue {
    const issue = new SonarIssue(getIssueLocationAtNode(node, message), this.ruleName);
    this.issues.push(issue);
    return issue;
  }

  public addIssueAtLocation(primaryLocation: IssueLocation): SonarIssue {
    const issue = new SonarIssue(primaryLocation, this.ruleName);
    this.issues.push(issue);
    return issue;
  }
}

export class TypedSonarRuleVisitor extends SonarRuleVisitor {
  public constructor(ruleName: string, protected program: ts.Program) {
    super(ruleName);
  }
}
export class IssueLocation {
  public readonly startLine: number;
  public readonly startColumn: number;
  public readonly endLine: number;
  public readonly endColumn: number;

  public constructor(
    public readonly start: number,
    public readonly end: number,
    public readonly sourceFile: ts.SourceFile,
    public message?: string,
  ) {
    this.message = message;

    const startPosition = lineAndCharacter(start, sourceFile);
    const endPosition = lineAndCharacter(end, sourceFile);

    this.startLine = startPosition.line;
    this.startColumn = startPosition.character;
    this.endLine = endPosition.line;
    this.endColumn = endPosition.character;
  }

  public toJson() {
    return {
      startLine: this.startLine,
      startCol: this.startColumn,
      endLine: this.endLine,
      endCol: this.endColumn,
      message: this.message,
    };
  }
}

export function getIssueLocationAtNode(node: ts.Node, message?: string) {
  return new IssueLocation(node.getStart(), node.getEnd(), node.getSourceFile(), message);
}

export class SonarIssue extends tslint.RuleFailure {
  private cost?: number;
  public readonly primaryLocation: IssueLocation;
  private secondaryLocations: IssueLocation[] = [];

  public constructor(primaryLocation: IssueLocation, ruleName: string) {
    super(
      primaryLocation.sourceFile,
      primaryLocation.start,
      primaryLocation.end,
      primaryLocation.message || "",
      ruleName,
    );
    this.primaryLocation = primaryLocation;
  }

  public toJson() {
    return {
      failure: this.primaryLocation.message!,
      startPosition: {
        line: this.primaryLocation.startLine,
        character: this.primaryLocation.startColumn,
        position: this.primaryLocation.start,
      },
      endPosition: {
        line: this.primaryLocation.endLine,
        character: this.primaryLocation.endColumn,
        position: this.primaryLocation.end,
      },
      name: this.primaryLocation.sourceFile.fileName,
      ruleName: this.getRuleName(),
      cost: this.cost,
      secondaryLocations: this.secondaryLocations.map(location => location.toJson()),
      ruleSeverity: this.getRuleSeverity(),
    };
  }

  public setCost(cost: number): SonarIssue {
    this.cost = cost;
    return this;
  }

  public addSecondaryLocation(secondaryLocation: IssueLocation): SonarIssue {
    this.secondaryLocations.push(secondaryLocation);
    return this;
  }

  public getSecondaryLocations() {
    return this.secondaryLocations;
  }

  public getCost() {
    return this.cost;
  }
}
