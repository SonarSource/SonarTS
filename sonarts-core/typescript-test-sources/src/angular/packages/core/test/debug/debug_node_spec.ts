/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {EventEmitter, Injectable, NO_ERRORS_SCHEMA} from '@angular/core';
import {Component, Directive, Input} from '@angular/core/src/metadata';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Injectable()
class Logger {
  logs: string[];

  constructor() { this.logs = []; }

  add(thing: string) { this.logs.push(thing); }
}

@Directive({selector: '[message]', inputs: ['message']})
class MessageDir {
  logger: Logger;

  constructor(logger: Logger) { this.logger = logger; }

  set message(newMessage: string) { this.logger.add(newMessage); }
}

@Component({
  selector: 'child-comp',
  template: `<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child" [innerHtml]="childBinding"></span>`,
})
class ChildComp {
  childBinding: string;

  constructor() { this.childBinding = 'Original'; }
}

@Component({
  selector: 'parent-comp',
  viewProviders: [Logger],
  template: `<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [innerHtml]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>`,
})
class ParentComp {
  parentBinding: string;
  constructor() { this.parentBinding = 'OriginalParent'; }
}

@Directive({selector: 'custom-emitter', outputs: ['myevent']})
class CustomEmitter {
  myevent: EventEmitter<any>;

  constructor() { this.myevent = new EventEmitter(); }
}

@Component({
  selector: 'events-comp',
  template: `<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>`,
})
class EventsComp {
  clicked: boolean;
  customed: boolean;

  constructor() {
    this.clicked = false;
    this.customed = false;
  }

  handleClick() { this.clicked = true; }

  handleCustom() { this.customed = true; }
}

@Component({
  selector: 'cond-content-comp',
  viewProviders: [Logger],
  template: `<div class="child" message="child" *ngIf="myBool"><ng-content></ng-content></div>`,
})
class ConditionalContentComp {
  myBool: boolean = false;
}

@Component({
  selector: 'conditional-parent-comp',
  viewProviders: [Logger],
  template: `<span class="parent" [innerHtml]="parentBinding"></span>
            <cond-content-comp class="cond-content-comp-class">
              <span class="from-parent"></span>
            </cond-content-comp>`,
})
class ConditionalParentComp {
  parentBinding: string;
  constructor() { this.parentBinding = 'OriginalParent'; }
}

@Component({
  selector: 'using-for',
  viewProviders: [Logger],
  template: `<span *ngFor="let thing of stuff" [innerHtml]="thing"></span>
            <ul message="list">
              <li *ngFor="let item of stuff" [innerHtml]="item"></li>
            </ul>`,
})
class UsingFor {
  stuff: string[];
  constructor() { this.stuff = ['one', 'two', 'three']; }
}

@Directive({selector: '[mydir]', exportAs: 'mydir'})
class MyDir {
}

@Component({
  selector: 'locals-comp',
  template: `
   <div mydir #alice="mydir"></div>
 `,
})
class LocalsComp {
}

@Component({
  selector: 'bank-account',
  template: `
   Bank Name: {{bank}}
   Account Id: {{id}}
 `
})
class BankAccount {
  @Input() bank: string;
  @Input('account') id: string;

  normalizedBankName: string;
}

@Component({
  selector: 'test-app',
  template: `
   <bank-account bank="RBC"
                 account="4747"
                 [style.width.px]="width"
                 [style.color]="color"
                 [class.closed]="isClosed"
                 [class.open]="!isClosed"></bank-account>
 `,
})
class TestApp {
  width = 200;
  color = 'red';
  isClosed = true;
}

export function main() {
  describe('debug element', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [
          ChildComp,
          ConditionalContentComp,
          ConditionalParentComp,
          CustomEmitter,
          EventsComp,
          LocalsComp,
          MessageDir,
          MyDir,
          ParentComp,
          TestApp,
          UsingFor,
        ],
        providers: [Logger],
        schemas: [NO_ERRORS_SCHEMA],
      });
    }));

    it('should list all child nodes', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      // The root component has 3 elements and 2 text node children.
      expect(fixture.debugElement.childNodes.length).toEqual(5);
    });

    it('should list all component child elements', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();
      const childEls = fixture.debugElement.children;

      // The root component has 3 elements in its view.
      expect(childEls.length).toEqual(3);
      expect(getDOM().hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
      expect(getDOM().hasClass(childEls[1].nativeElement, 'parent')).toBe(true);
      expect(getDOM().hasClass(childEls[2].nativeElement, 'child-comp-class')).toBe(true);

      const nested = childEls[0].children;
      expect(nested.length).toEqual(1);
      expect(getDOM().hasClass(nested[0].nativeElement, 'parentnested')).toBe(true);

      const childComponent = childEls[2];

      const childCompChildren = childComponent.children;
      expect(childCompChildren.length).toEqual(2);
      expect(getDOM().hasClass(childCompChildren[0].nativeElement, 'child')).toBe(true);
      expect(getDOM().hasClass(childCompChildren[1].nativeElement, 'child')).toBe(true);

      const childNested = childCompChildren[0].children;
      expect(childNested.length).toEqual(1);
      expect(getDOM().hasClass(childNested[0].nativeElement, 'childnested')).toBe(true);
    });

    it('should list conditional component child elements', () => {
      fixture = TestBed.createComponent(ConditionalParentComp);
      fixture.detectChanges();

      const childEls = fixture.debugElement.children;

      // The root component has 2 elements in its view.
      expect(childEls.length).toEqual(2);
      expect(getDOM().hasClass(childEls[0].nativeElement, 'parent')).toBe(true);
      expect(getDOM().hasClass(childEls[1].nativeElement, 'cond-content-comp-class')).toBe(true);

      const conditionalContentComp = childEls[1];

      expect(conditionalContentComp.children.length).toEqual(0);

      conditionalContentComp.componentInstance.myBool = true;
      fixture.detectChanges();

      expect(conditionalContentComp.children.length).toEqual(1);
    });

    it('should list child elements within viewports', () => {
      fixture = TestBed.createComponent(UsingFor);
      fixture.detectChanges();

      const childEls = fixture.debugElement.children;
      expect(childEls.length).toEqual(4);

      // The 4th child is the <ul>
      const list = childEls[3];

      expect(list.children.length).toEqual(3);
    });

    it('should list element attributes', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.attributes['bank']).toEqual('RBC');
      expect(bankElem.attributes['account']).toEqual('4747');
    });

    it('should list element classes', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.classes['closed']).toBe(true);
      expect(bankElem.classes['open']).toBe(false);
    });

    it('should list element styles', () => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const bankElem = fixture.debugElement.children[0];

      expect(bankElem.styles['width']).toEqual('200px');
      expect(bankElem.styles['color']).toEqual('red');
    });

    it('should query child elements by css', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      const childTestEls = fixture.debugElement.queryAll(By.css('child-comp'));

      expect(childTestEls.length).toBe(1);
      expect(getDOM().hasClass(childTestEls[0].nativeElement, 'child-comp-class')).toBe(true);
    });

    it('should query child elements by directive', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      const childTestEls = fixture.debugElement.queryAll(By.directive(MessageDir));

      expect(childTestEls.length).toBe(4);
      expect(getDOM().hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
      expect(getDOM().hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
      expect(getDOM().hasClass(childTestEls[2].nativeElement, 'child')).toBe(true);
      expect(getDOM().hasClass(childTestEls[3].nativeElement, 'childnested')).toBe(true);
    });

    it('should list providerTokens', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      expect(fixture.debugElement.providerTokens).toContain(Logger);
    });

    it('should list locals', () => {
      fixture = TestBed.createComponent(LocalsComp);
      fixture.detectChanges();

      expect(fixture.debugElement.children[0].references !['alice']).toBeAnInstanceOf(MyDir);
    });

    it('should allow injecting from the element injector', () => {
      fixture = TestBed.createComponent(ParentComp);
      fixture.detectChanges();

      expect((<Logger>(fixture.debugElement.children[0].injector.get(Logger))).logs).toEqual([
        'parent', 'nestedparent', 'child', 'nestedchild'
      ]);
    });

    it('should list event listeners', () => {
      fixture = TestBed.createComponent(EventsComp);
      fixture.detectChanges();

      expect(fixture.debugElement.children[0].listeners.length).toEqual(1);
      expect(fixture.debugElement.children[1].listeners.length).toEqual(1);

    });

    it('should trigger event handlers', () => {
      fixture = TestBed.createComponent(EventsComp);
      fixture.detectChanges();

      expect(fixture.componentInstance.clicked).toBe(false);
      expect(fixture.componentInstance.customed).toBe(false);

      fixture.debugElement.children[0].triggerEventHandler('click', <Event>{});
      expect(fixture.componentInstance.clicked).toBe(true);

      fixture.debugElement.children[1].triggerEventHandler('myevent', <Event>{});
      expect(fixture.componentInstance.customed).toBe(true);

    });
  });
}
