/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../parse_util';

export class Message {
  sources: MessageSpan[];

  /**
   * @param nodes message AST
   * @param placeholders maps placeholder names to static content
   * @param placeholderToMessage maps placeholder names to messages (used for nested ICU messages)
   * @param meaning
   * @param description
   * @param id
   */
  constructor(
      public nodes: Node[], public placeholders: {[phName: string]: string},
      public placeholderToMessage: {[phName: string]: Message}, public meaning: string,
      public description: string, public id: string) {
    if (nodes.length) {
      this.sources = [{
        filePath: nodes[0].sourceSpan.start.file.url,
        startLine: nodes[0].sourceSpan.start.line + 1,
        startCol: nodes[0].sourceSpan.start.col + 1,
        endLine: nodes[nodes.length - 1].sourceSpan.end.line + 1,
        endCol: nodes[0].sourceSpan.start.col + 1
      }];
    } else {
      this.sources = [];
    }
  }
}

// line and columns indexes are 1 based
export interface MessageSpan {
  filePath: string;
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export interface Node {
  sourceSpan: ParseSourceSpan;
  visit(visitor: Visitor, context?: any): any;
}

export class Text implements Node {
  constructor(public value: string, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitText(this, context); }
}

// TODO(vicb): do we really need this node (vs an array) ?
export class Container implements Node {
  constructor(public children: Node[], public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitContainer(this, context); }
}

export class Icu implements Node {
  public expressionPlaceholder: string;
  constructor(
      public expression: string, public type: string, public cases: {[k: string]: Node},
      public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitIcu(this, context); }
}

export class TagPlaceholder implements Node {
  constructor(
      public tag: string, public attrs: {[k: string]: string}, public startName: string,
      public closeName: string, public children: Node[], public isVoid: boolean,
      public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitTagPlaceholder(this, context); }
}

export class Placeholder implements Node {
  constructor(public value: string, public name: string, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitPlaceholder(this, context); }
}

export class IcuPlaceholder implements Node {
  constructor(public value: Icu, public name: string, public sourceSpan: ParseSourceSpan) {}

  visit(visitor: Visitor, context?: any): any { return visitor.visitIcuPlaceholder(this, context); }
}

export interface Visitor {
  visitText(text: Text, context?: any): any;
  visitContainer(container: Container, context?: any): any;
  visitIcu(icu: Icu, context?: any): any;
  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any;
  visitPlaceholder(ph: Placeholder, context?: any): any;
  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any;
}

// Clone the AST
export class CloneVisitor implements Visitor {
  visitText(text: Text, context?: any): Text { return new Text(text.value, text.sourceSpan); }

  visitContainer(container: Container, context?: any): Container {
    const children = container.children.map(n => n.visit(this, context));
    return new Container(children, container.sourceSpan);
  }

  visitIcu(icu: Icu, context?: any): Icu {
    const cases: {[k: string]: Node} = {};
    Object.keys(icu.cases).forEach(key => cases[key] = icu.cases[key].visit(this, context));
    const msg = new Icu(icu.expression, icu.type, cases, icu.sourceSpan);
    msg.expressionPlaceholder = icu.expressionPlaceholder;
    return msg;
  }

  visitTagPlaceholder(ph: TagPlaceholder, context?: any): TagPlaceholder {
    const children = ph.children.map(n => n.visit(this, context));
    return new TagPlaceholder(
        ph.tag, ph.attrs, ph.startName, ph.closeName, children, ph.isVoid, ph.sourceSpan);
  }

  visitPlaceholder(ph: Placeholder, context?: any): Placeholder {
    return new Placeholder(ph.value, ph.name, ph.sourceSpan);
  }

  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): IcuPlaceholder {
    return new IcuPlaceholder(ph.value, ph.name, ph.sourceSpan);
  }
}

// Visit all the nodes recursively
export class RecurseVisitor implements Visitor {
  visitText(text: Text, context?: any): any{};

  visitContainer(container: Container, context?: any): any {
    container.children.forEach(child => child.visit(this));
  }

  visitIcu(icu: Icu, context?: any): any {
    Object.keys(icu.cases).forEach(k => { icu.cases[k].visit(this); });
  }

  visitTagPlaceholder(ph: TagPlaceholder, context?: any): any {
    ph.children.forEach(child => child.visit(this));
  }

  visitPlaceholder(ph: Placeholder, context?: any): any{};

  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): any{};
}
