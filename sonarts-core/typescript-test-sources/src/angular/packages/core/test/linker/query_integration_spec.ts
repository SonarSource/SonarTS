/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, ContentChild, ContentChildren, Directive, QueryList, TemplateRef, Type, ViewChild, ViewChildren, ViewContainerRef, asNativeElements} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {stringify} from '../../src/util';

export function main() {
  describe('Query API', () => {

    beforeEach(() => TestBed.configureTestingModule({
      declarations: [
        MyComp0,
        NeedsQuery,
        NeedsQueryDesc,
        NeedsQueryByLabel,
        NeedsQueryByTwoLabels,
        NeedsQueryAndProject,
        NeedsViewQuery,
        NeedsViewQueryIf,
        NeedsViewQueryNestedIf,
        NeedsViewQueryOrder,
        NeedsViewQueryByLabel,
        NeedsViewQueryOrderWithParent,
        NeedsContentChildren,
        NeedsViewChildren,
        NeedsViewChild,
        NeedsStaticContentAndViewChild,
        NeedsContentChild,
        NeedsTpl,
        NeedsNamedTpl,
        TextDirective,
        InertDirective,
        NeedsFourQueries,
        NeedsContentChildrenWithRead,
        NeedsContentChildWithRead,
        NeedsViewChildrenWithRead,
        NeedsViewChildWithRead,
        NeedsContentChildTemplateRef,
        NeedsContentChildTemplateRefApp,
        NeedsViewContainerWithRead,
        ManualProjecting
      ]
    }));

    describe('querying by directive type', () => {
      it('should contain all direct child directives in the light dom (constructor)', () => {
        const template = '<div text="1"></div>' +
            '<needs-query text="2"><div text="3">' +
            '<div text="too-deep"></div>' +
            '</div></needs-query>' +
            '<div text="4"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');
      });

      it('should contain all direct child directives in the content dom', () => {
        const template =
            '<needs-content-children #q><div text="foo"></div></needs-content-children>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const q = view.debugElement.children[0].references !['q'];
        view.detectChanges();
        expect(q.textDirChildren.length).toEqual(1);
        expect(q.numberOfChildrenAfterContentInit).toEqual(1);
      });

      it('should contain the first content child', () => {
        const template =
            '<needs-content-child #q><div *ngIf="shouldShow" text="foo"></div></needs-content-child>';
        const view = createTestCmp(MyComp0, template);
        view.componentInstance.shouldShow = true;
        view.detectChanges();
        const q: NeedsContentChild = view.debugElement.children[0].references !['q'];
        expect(q.logs).toEqual([['setter', 'foo'], ['init', 'foo'], ['check', 'foo']]);

        view.componentInstance.shouldShow = false;
        view.detectChanges();
        expect(q.logs).toEqual([
          ['setter', 'foo'], ['init', 'foo'], ['check', 'foo'], ['setter', null], ['check', null]
        ]);
      });

      it('should contain the first view child', () => {
        const template = '<needs-view-child #q></needs-view-child>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const q: NeedsViewChild = view.debugElement.children[0].references !['q'];
        expect(q.logs).toEqual([['setter', 'foo'], ['init', 'foo'], ['check', 'foo']]);

        q.shouldShow = false;
        view.detectChanges();
        expect(q.logs).toEqual([
          ['setter', 'foo'], ['init', 'foo'], ['check', 'foo'], ['setter', null], ['check', null]
        ]);
      });

      it('should set static view and content children already after the constructor call', () => {
        const template =
            '<needs-static-content-view-child #q><div text="contentFoo"></div></needs-static-content-view-child>';
        const view = createTestCmp(MyComp0, template);
        const q: NeedsStaticContentAndViewChild = view.debugElement.children[0].references !['q'];
        expect(q.contentChild.text).toBeFalsy();
        expect(q.viewChild.text).toBeFalsy();

        view.detectChanges();
        expect(q.contentChild.text).toEqual('contentFoo');
        expect(q.viewChild.text).toEqual('viewFoo');
      });

      it('should contain the first view child across embedded views', () => {
        TestBed.overrideComponent(
            MyComp0, {set: {template: '<needs-view-child #q></needs-view-child>'}});
        TestBed.overrideComponent(NeedsViewChild, {
          set: {
            template:
                '<div *ngIf="true"><div *ngIf="shouldShow" text="foo"></div></div><div *ngIf="shouldShow2" text="bar"></div>'
          }
        });
        const view = TestBed.createComponent(MyComp0);

        view.detectChanges();
        const q: NeedsViewChild = view.debugElement.children[0].references !['q'];
        expect(q.logs).toEqual([['setter', 'foo'], ['init', 'foo'], ['check', 'foo']]);

        q.shouldShow = false;
        q.shouldShow2 = true;
        q.logs = [];
        view.detectChanges();
        expect(q.logs).toEqual([['setter', 'bar'], ['check', 'bar']]);

        q.shouldShow = false;
        q.shouldShow2 = false;
        q.logs = [];
        view.detectChanges();
        expect(q.logs).toEqual([['setter', null], ['check', null]]);
      });

      it('should contain all directives in the light dom when descendants flag is used', () => {
        const template = '<div text="1"></div>' +
            '<needs-query-desc text="2"><div text="3">' +
            '<div text="4"></div>' +
            '</div></needs-query-desc>' +
            '<div text="5"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|4|');
      });

      it('should contain all directives in the light dom', () => {
        const template = '<div text="1"></div>' +
            '<needs-query text="2"><div text="3"></div></needs-query>' +
            '<div text="4"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');
      });

      it('should reflect dynamically inserted directives', () => {
        const template = '<div text="1"></div>' +
            '<needs-query text="2"><div *ngIf="shouldShow" [text]="\'3\'"></div></needs-query>' +
            '<div text="4"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        expect(asNativeElements(view.debugElement.children)).toHaveText('2|');

        view.componentInstance.shouldShow = true;
        view.detectChanges();
        expect(asNativeElements(view.debugElement.children)).toHaveText('2|3|');
      });

      it('should be cleanly destroyed when a query crosses view boundaries', () => {
        const template = '<div text="1"></div>' +
            '<needs-query text="2"><div *ngIf="shouldShow" [text]="\'3\'"></div></needs-query>' +
            '<div text="4"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        view.componentInstance.shouldShow = true;
        view.detectChanges();
        view.destroy();
      });

      it('should reflect moved directives', () => {
        const template = '<div text="1"></div>' +
            '<needs-query text="2"><div *ngFor="let  i of list" [text]="i"></div></needs-query>' +
            '<div text="4"></div>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        expect(asNativeElements(view.debugElement.children)).toHaveText('2|1d|2d|3d|');

        view.componentInstance.list = ['3d', '2d'];
        view.detectChanges();
        expect(asNativeElements(view.debugElement.children)).toHaveText('2|3d|2d|');
      });

      it('should throw with descriptive error when query selectors are not present', () => {
        TestBed.configureTestingModule({declarations: [MyCompBroken0, HasNullQueryCondition]});
        const template = '<has-null-query-condition></has-null-query-condition>';
        TestBed.overrideComponent(MyCompBroken0, {set: {template}});
        expect(() => TestBed.createComponent(MyCompBroken0))
            .toThrowError(
                `Can't construct a query for the property "errorTrigger" of "${stringify(HasNullQueryCondition)}" since the query selector wasn't defined.`);
      });
    });

    describe('query for TemplateRef', () => {
      it('should find TemplateRefs in the light and shadow dom', () => {
        const template = '<needs-tpl><ng-template><div>light</div></ng-template></needs-tpl>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const needsTpl: NeedsTpl = view.debugElement.children[0].injector.get(NeedsTpl);

        expect(needsTpl.vc.createEmbeddedView(needsTpl.query.first).rootNodes[0])
            .toHaveText('light');
        expect(needsTpl.vc.createEmbeddedView(needsTpl.viewQuery.first).rootNodes[0])
            .toHaveText('shadow');
      });

      it('should find named TemplateRefs', () => {
        const template =
            '<needs-named-tpl><ng-template #tpl><div>light</div></ng-template></needs-named-tpl>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const needsTpl: NeedsNamedTpl = view.debugElement.children[0].injector.get(NeedsNamedTpl);
        expect(needsTpl.vc.createEmbeddedView(needsTpl.contentTpl).rootNodes[0])
            .toHaveText('light');
        expect(needsTpl.vc.createEmbeddedView(needsTpl.viewTpl).rootNodes[0]).toHaveText('shadow');
      });
    });

    describe('read a different token', () => {
      it('should contain all content children', () => {
        const template =
            '<needs-content-children-read #q text="ca"><div #q text="cb"></div></needs-content-children-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsContentChildrenWithRead =
            view.debugElement.children[0].injector.get(NeedsContentChildrenWithRead);
        expect(comp.textDirChildren.map(textDirective => textDirective.text)).toEqual(['ca', 'cb']);
      });

      it('should contain the first content child', () => {
        const template =
            '<needs-content-child-read><div #q text="ca"></div></needs-content-child-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsContentChildWithRead =
            view.debugElement.children[0].injector.get(NeedsContentChildWithRead);
        expect(comp.textDirChild.text).toEqual('ca');
      });

      it('should contain the first descendant content child', () => {
        const template = '<needs-content-child-read>' +
            '<div dir><div #q text="ca"></div></div>' +
            '</needs-content-child-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsContentChildWithRead =
            view.debugElement.children[0].injector.get(NeedsContentChildWithRead);
        expect(comp.textDirChild.text).toEqual('ca');
      });

      it('should contain the first descendant content child templateRef', () => {
        const template = '<needs-content-child-template-ref-app>' +
            '</needs-content-child-template-ref-app>';
        const view = createTestCmp(MyComp0, template);

        // can't execute checkNoChanges as our view modifies our content children (via a query).
        view.detectChanges(false);
        expect(view.nativeElement).toHaveText('OUTER');
      });

      it('should contain the first view child', () => {
        const template = '<needs-view-child-read></needs-view-child-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsViewChildWithRead =
            view.debugElement.children[0].injector.get(NeedsViewChildWithRead);
        expect(comp.textDirChild.text).toEqual('va');
      });

      it('should contain all child directives in the view', () => {
        const template = '<needs-view-children-read></needs-view-children-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsViewChildrenWithRead =
            view.debugElement.children[0].injector.get(NeedsViewChildrenWithRead);
        expect(comp.textDirChildren.map(textDirective => textDirective.text)).toEqual(['va', 'vb']);
      });

      it('should support reading a ViewContainer', () => {
        const template =
            '<needs-viewcontainer-read><ng-template>hello</ng-template></needs-viewcontainer-read>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const comp: NeedsViewContainerWithRead =
            view.debugElement.children[0].injector.get(NeedsViewContainerWithRead);
        comp.createView();
        expect(view.debugElement.children[0].nativeElement).toHaveText('hello');
      });
    });

    describe('changes', () => {
      it('should notify query on change', async(() => {
           const template = '<needs-query #q>' +
               '<div text="1"></div>' +
               '<div *ngIf="shouldShow" text="2"></div>' +
               '</needs-query>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);

           const q = view.debugElement.children[0].references !['q'];

           q.query.changes.subscribe({
             next: () => {
               expect(q.query.first.text).toEqual('1');
               expect(q.query.last.text).toEqual('2');
             }
           });

           view.componentInstance.shouldShow = true;
           view.detectChanges();
         }));

      it('should correctly clean-up when destroyed together with the directives it is querying',
         () => {
           const template =
               '<needs-query #q *ngIf="shouldShow"><div text="foo"></div></needs-query>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);
           view.componentInstance.shouldShow = true;
           view.detectChanges();

           const q: NeedsQuery = view.debugElement.children[0].references !['q'];
           expect(q.query.length).toEqual(1);

           view.componentInstance.shouldShow = false;
           view.detectChanges();
           view.componentInstance.shouldShow = true;
           view.detectChanges();
           const q2: NeedsQuery = view.debugElement.children[0].references !['q'];

           expect(q2.query.length).toEqual(1);
         });
    });

    describe('querying by var binding', () => {
      it('should contain all the child directives in the light dom with the given var binding',
         () => {
           const template = '<needs-query-by-ref-binding #q>' +
               '<div *ngFor="let item of list" [text]="item" #textLabel="textDir"></div>' +
               '</needs-query-by-ref-binding>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);
           const q = view.debugElement.children[0].references !['q'];

           view.componentInstance.list = ['1d', '2d'];
           view.detectChanges();
           expect(q.query.first.text).toEqual('1d');
           expect(q.query.last.text).toEqual('2d');
         });

      it('should support querying by multiple var bindings', () => {
        const template = '<needs-query-by-ref-bindings #q>' +
            '<div text="one" #textLabel1="textDir"></div>' +
            '<div text="two" #textLabel2="textDir"></div>' +
            '</needs-query-by-ref-bindings>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];

        expect(q.query.first.text).toEqual('one');
        expect(q.query.last.text).toEqual('two');
      });

      it('should support dynamically inserted directives', () => {
        const template = '<needs-query-by-ref-binding #q>' +
            '<div *ngFor="let item of list" [text]="item" #textLabel="textDir"></div>' +
            '</needs-query-by-ref-binding>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];

        view.componentInstance.list = ['1d', '2d'];
        view.detectChanges();
        view.componentInstance.list = ['2d', '1d'];
        view.detectChanges();
        expect(q.query.last.text).toEqual('1d');
      });

      it('should contain all the elements in the light dom with the given var binding', () => {
        const template = '<needs-query-by-ref-binding #q>' +
            '<div *ngFor="let item of list">' +
            '<div #textLabel>{{item}}</div>' +
            '</div>' +
            '</needs-query-by-ref-binding>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];

        view.componentInstance.list = ['1d', '2d'];
        view.detectChanges();
        expect(q.query.first.nativeElement).toHaveText('1d');
        expect(q.query.last.nativeElement).toHaveText('2d');
      });

      it('should contain all the elements in the light dom even if they get projected', () => {
        const template = '<needs-query-and-project #q>' +
            '<div text="hello"></div><div text="world"></div>' +
            '</needs-query-and-project>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        expect(asNativeElements(view.debugElement.children)).toHaveText('hello|world|');
      });

      it('should support querying the view by using a view query', () => {
        const template = '<needs-view-query-by-ref-binding #q></needs-view-query-by-ref-binding>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);

        const q: NeedsViewQueryByLabel = view.debugElement.children[0].references !['q'];
        expect(q.query.first.nativeElement).toHaveText('text');
      });

      it('should contain all child directives in the view dom', () => {
        const template = '<needs-view-children #q></needs-view-children>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];
        expect(q.textDirChildren.length).toEqual(1);
        expect(q.numberOfChildrenAfterViewInit).toEqual(1);
      });
    });

    describe('querying in the view', () => {
      it('should contain all the elements in the view with that have the given directive', () => {
        const template = '<needs-view-query #q><div text="ignoreme"></div></needs-view-query>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q: NeedsViewQuery = view.debugElement.children[0].references !['q'];
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2', '3', '4']);
      });

      it('should not include directive present on the host element', () => {
        const template = '<needs-view-query #q text="self"></needs-view-query>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q: NeedsViewQuery = view.debugElement.children[0].references !['q'];
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2', '3', '4']);
      });

      it('should reflect changes in the component', () => {
        const template = '<needs-view-query-if #q></needs-view-query-if>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q: NeedsViewQueryIf = view.debugElement.children[0].references !['q'];
        expect(q.query.length).toBe(0);

        q.show = true;
        view.detectChanges();
        expect(q.query.length).toBe(1);
        expect(q.query.first.text).toEqual('1');
      });

      it('should not be affected by other changes in the component', () => {
        const template = '<needs-view-query-nested-if #q></needs-view-query-nested-if>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q: NeedsViewQueryNestedIf = view.debugElement.children[0].references !['q'];

        expect(q.query.length).toEqual(1);
        expect(q.query.first.text).toEqual('1');

        q.show = false;
        view.detectChanges();
        expect(q.query.length).toEqual(1);
        expect(q.query.first.text).toEqual('1');
      });

      it('should maintain directives in pre-order depth-first DOM order after dynamic insertion',
         () => {
           const template = '<needs-view-query-order #q></needs-view-query-order>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);
           const q: NeedsViewQueryOrder = view.debugElement.children[0].references !['q'];

           expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2', '3', '4']);

           q.list = ['-3', '2'];
           view.detectChanges();
           expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '-3', '2', '4']);
         });

      it('should maintain directives in pre-order depth-first DOM order after dynamic insertion',
         () => {
           const template = '<needs-view-query-order-with-p #q></needs-view-query-order-with-p>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);
           const q: NeedsViewQueryOrderWithParent = view.debugElement.children[0].references !['q'];
           expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2', '3', '4']);

           q.list = ['-3', '2'];
           view.detectChanges();
           expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '-3', '2', '4']);
         });

      it('should handle long ngFor cycles', () => {
        const template = '<needs-view-query-order #q></needs-view-query-order>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q: NeedsViewQueryOrder = view.debugElement.children[0].references !['q'];

        // no significance to 50, just a reasonably large cycle.
        for (let i = 0; i < 50; i++) {
          const newString = i.toString();
          q.list = [newString];
          view.detectChanges();
          expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', newString, '4']);
        }
      });

      it('should support more than three queries', () => {
        const template = '<needs-four-queries #q><div text="1"></div></needs-four-queries>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];
        expect(q.query1).toBeDefined();
        expect(q.query2).toBeDefined();
        expect(q.query3).toBeDefined();
        expect(q.query4).toBeDefined();
      });
    });

    describe('query over moved templates', () => {
      it('should include manually projected templates in queries', () => {
        const template =
            '<manual-projecting #q><ng-template><div text="1"></div></ng-template></manual-projecting>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];
        expect(q.query.length).toBe(0);

        q.create();
        view.detectChanges();
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1']);

        q.destroy();
        view.detectChanges();
        expect(q.query.length).toBe(0);
      });

      // Note: This tests is just document our current behavior, which we do
      // for performance reasons.
      it('should not affected queries for projected templates if views are detached or moved', () => {
        const template =
            '<manual-projecting #q><ng-template let-x="x"><div [text]="x"></div></ng-template></manual-projecting>';
        const view = createTestCmpAndDetectChanges(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'] as ManualProjecting;
        expect(q.query.length).toBe(0);

        const view1 = q.vc.createEmbeddedView(q.template, {'x': '1'});
        const view2 = q.vc.createEmbeddedView(q.template, {'x': '2'});
        view.detectChanges();
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2']);

        q.vc.detach(1);
        q.vc.detach(0);

        view.detectChanges();
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2']);

        q.vc.insert(view2);
        q.vc.insert(view1);

        view.detectChanges();
        expect(q.query.map((d: TextDirective) => d.text)).toEqual(['1', '2']);
      });

      it('should remove manually projected templates if their parent view is destroyed', () => {
        const template = `
          <manual-projecting #q><ng-template #tpl><div text="1"></div></ng-template></manual-projecting>
          <div *ngIf="shouldShow">
            <ng-container [ngTemplateOutlet]="tpl"></ng-container>
          </div>
        `;
        const view = createTestCmp(MyComp0, template);
        const q = view.debugElement.children[0].references !['q'];
        view.componentInstance.shouldShow = true;
        view.detectChanges();

        expect(q.query.length).toBe(1);

        view.componentInstance.shouldShow = false;
        view.detectChanges();
        expect(q.query.length).toBe(0);
      });

      it('should not throw if a content template is queried and created in the view during change detection',
         () => {
           @Component(
               {selector: 'auto-projecting', template: '<div *ngIf="true; then: content"></div>'})
           class AutoProjecting {
             @ContentChild(TemplateRef)
             content: TemplateRef<any>;

             @ContentChildren(TextDirective)
             query: QueryList<TextDirective>;
           }

           TestBed.configureTestingModule({declarations: [AutoProjecting]});
           const template =
               '<auto-projecting #q><ng-template><div text="1"></div></ng-template></auto-projecting>';
           const view = createTestCmpAndDetectChanges(MyComp0, template);

           const q = view.debugElement.children[0].references !['q'];
           // This should be 1, but due to
           // https://github.com/angular/angular/issues/15117 this is 0.
           expect(q.query.length).toBe(0);
         });

    });
  });
}

@Directive({selector: '[text]', inputs: ['text'], exportAs: 'textDir'})
class TextDirective {
  text: string;
  constructor() {}
}

@Component({selector: 'needs-content-children', template: ''})
class NeedsContentChildren implements AfterContentInit {
  @ContentChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterContentInit: number;

  ngAfterContentInit() { this.numberOfChildrenAfterContentInit = this.textDirChildren.length; }
}

@Component({selector: 'needs-view-children', template: '<div text></div>'})
class NeedsViewChildren implements AfterViewInit {
  @ViewChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterViewInit: number;

  ngAfterViewInit() { this.numberOfChildrenAfterViewInit = this.textDirChildren.length; }
}

@Component({selector: 'needs-content-child', template: ''})
class NeedsContentChild implements AfterContentInit, AfterContentChecked {
  /** @internal */
  _child: TextDirective;

  @ContentChild(TextDirective)
  set child(value) {
    this._child = value;
    this.logs.push(['setter', value ? value.text : null]);
  }

  get child() { return this._child; }
  logs: any[] /** TODO #9100 */ = [];

  ngAfterContentInit() { this.logs.push(['init', this.child ? this.child.text : null]); }

  ngAfterContentChecked() { this.logs.push(['check', this.child ? this.child.text : null]); }
}

@Component({selector: 'needs-view-child', template: `<div *ngIf="shouldShow" text="foo"></div>`})
class NeedsViewChild implements AfterViewInit, AfterViewChecked {
  shouldShow: boolean = true;
  shouldShow2: boolean = false;
  /** @internal */
  _child: TextDirective;

  @ViewChild(TextDirective)
  set child(value) {
    this._child = value;
    this.logs.push(['setter', value ? value.text : null]);
  }

  get child() { return this._child; }
  logs: any[] /** TODO #9100 */ = [];

  ngAfterViewInit() { this.logs.push(['init', this.child ? this.child.text : null]); }

  ngAfterViewChecked() { this.logs.push(['check', this.child ? this.child.text : null]); }
}

function createTestCmp<T>(type: Type<T>, template: string): ComponentFixture<T> {
  const view = TestBed.overrideComponent(type, {set: {template}}).createComponent(type);
  return view;
}


function createTestCmpAndDetectChanges<T>(type: Type<T>, template: string): ComponentFixture<T> {
  const view = createTestCmp(type, template);
  view.detectChanges();
  return view;
}

@Component({selector: 'needs-static-content-view-child', template: `<div text="viewFoo"></div>`})
class NeedsStaticContentAndViewChild {
  @ContentChild(TextDirective) contentChild: TextDirective;
  @ViewChild(TextDirective) viewChild: TextDirective;
}

@Directive({selector: '[dir]'})
class InertDirective {
}

@Component({
  selector: 'needs-query',
  template: '<div text="ignoreme"></div><b *ngFor="let  dir of query">{{dir.text}}|</b>'
})
class NeedsQuery {
  @ContentChildren(TextDirective) query: QueryList<TextDirective>;
}

@Component({selector: 'needs-four-queries', template: ''})
class NeedsFourQueries {
  @ContentChild(TextDirective) query1: TextDirective;
  @ContentChild(TextDirective) query2: TextDirective;
  @ContentChild(TextDirective) query3: TextDirective;
  @ContentChild(TextDirective) query4: TextDirective;
}

@Component({
  selector: 'needs-query-desc',
  template: '<ng-content></ng-content><div *ngFor="let  dir of query">{{dir.text}}|</div>'
})
class NeedsQueryDesc {
  @ContentChildren(TextDirective, {descendants: true}) query: QueryList<TextDirective>;
}

@Component({selector: 'needs-query-by-ref-binding', template: '<ng-content>'})
class NeedsQueryByLabel {
  @ContentChildren('textLabel', {descendants: true}) query: QueryList<any>;
}

@Component({selector: 'needs-view-query-by-ref-binding', template: '<div #textLabel>text</div>'})
class NeedsViewQueryByLabel {
  @ViewChildren('textLabel') query: QueryList<any>;
}

@Component({selector: 'needs-query-by-ref-bindings', template: '<ng-content>'})
class NeedsQueryByTwoLabels {
  @ContentChildren('textLabel1,textLabel2', {descendants: true}) query: QueryList<any>;
}

@Component({
  selector: 'needs-query-and-project',
  template: '<div *ngFor="let  dir of query">{{dir.text}}|</div><ng-content></ng-content>'
})
class NeedsQueryAndProject {
  @ContentChildren(TextDirective) query: QueryList<TextDirective>;
}

@Component({
  selector: 'needs-view-query',
  template: '<div text="1"><div text="2"></div></div><div text="3"></div><div text="4"></div>'
})
class NeedsViewQuery {
  @ViewChildren(TextDirective) query: QueryList<TextDirective>;
}

@Component({selector: 'needs-view-query-if', template: '<div *ngIf="show" text="1"></div>'})
class NeedsViewQueryIf {
  show: boolean = false;
  @ViewChildren(TextDirective) query: QueryList<TextDirective>;
}

@Component({
  selector: 'needs-view-query-nested-if',
  template: '<div text="1"><div *ngIf="show"><div dir></div></div></div>'
})
class NeedsViewQueryNestedIf {
  show: boolean = true;
  @ViewChildren(TextDirective) query: QueryList<TextDirective>;
}

@Component({
  selector: 'needs-view-query-order',
  template: '<div text="1"></div>' +
      '<div *ngFor="let  i of list" [text]="i"></div>' +
      '<div text="4"></div>'
})
class NeedsViewQueryOrder {
  @ViewChildren(TextDirective) query: QueryList<TextDirective>;
  list: string[] = ['2', '3'];
}

@Component({
  selector: 'needs-view-query-order-with-p',
  template: '<div dir><div text="1"></div>' +
      '<div *ngFor="let  i of list" [text]="i"></div>' +
      '<div text="4"></div></div>'
})
class NeedsViewQueryOrderWithParent {
  @ViewChildren(TextDirective) query: QueryList<TextDirective>;
  list: string[] = ['2', '3'];
}

@Component({selector: 'needs-tpl', template: '<ng-template><div>shadow</div></ng-template>'})
class NeedsTpl {
  @ViewChildren(TemplateRef) viewQuery: QueryList<TemplateRef<Object>>;
  @ContentChildren(TemplateRef) query: QueryList<TemplateRef<Object>>;
  constructor(public vc: ViewContainerRef) {}
}

@Component(
    {selector: 'needs-named-tpl', template: '<ng-template #tpl><div>shadow</div></ng-template>'})
class NeedsNamedTpl {
  @ViewChild('tpl') viewTpl: TemplateRef<Object>;
  @ContentChild('tpl') contentTpl: TemplateRef<Object>;
  constructor(public vc: ViewContainerRef) {}
}

@Component({selector: 'needs-content-children-read', template: ''})
class NeedsContentChildrenWithRead {
  @ContentChildren('q', {read: TextDirective}) textDirChildren: QueryList<TextDirective>;
  @ContentChildren('nonExisting', {read: TextDirective}) nonExistingVar: QueryList<TextDirective>;
}

@Component({selector: 'needs-content-child-read', template: ''})
class NeedsContentChildWithRead {
  @ContentChild('q', {read: TextDirective}) textDirChild: TextDirective;
  @ContentChild('nonExisting', {read: TextDirective}) nonExistingVar: TextDirective;
}

@Component({
  selector: 'needs-content-child-template-ref',
  template: '<div [ngTemplateOutlet]="templateRef"></div>'
})
class NeedsContentChildTemplateRef {
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
}

@Component({
  selector: 'needs-content-child-template-ref-app',
  template: '<needs-content-child-template-ref>' +
      '<ng-template>OUTER<ng-template>INNER</ng-template></ng-template>' +
      '</needs-content-child-template-ref>'
})
class NeedsContentChildTemplateRefApp {
}

@Component({
  selector: 'needs-view-children-read',
  template: '<div #q text="va"></div><div #w text="vb"></div>',
})
class NeedsViewChildrenWithRead {
  @ViewChildren('q,w', {read: TextDirective}) textDirChildren: QueryList<TextDirective>;
  @ViewChildren('nonExisting', {read: TextDirective}) nonExistingVar: QueryList<TextDirective>;
}

@Component({
  selector: 'needs-view-child-read',
  template: '<div #q text="va"></div>',
})
class NeedsViewChildWithRead {
  @ViewChild('q', {read: TextDirective}) textDirChild: TextDirective;
  @ViewChild('nonExisting', {read: TextDirective}) nonExistingVar: TextDirective;
}

@Component({selector: 'needs-viewcontainer-read', template: '<div #q></div>'})
class NeedsViewContainerWithRead {
  @ViewChild('q', {read: ViewContainerRef}) vc: ViewContainerRef;
  @ViewChild('nonExisting', {read: ViewContainerRef}) nonExistingVar: ViewContainerRef;
  @ContentChild(TemplateRef) template: TemplateRef<Object>;

  createView() { this.vc.createEmbeddedView(this.template); }
}

@Component({selector: 'has-null-query-condition', template: '<div></div>'})
class HasNullQueryCondition {
  @ContentChildren(null !) errorTrigger: any;
}

@Component({selector: 'my-comp', template: ''})
class MyComp0 {
  shouldShow: boolean = false;
  list: string[] = ['1d', '2d', '3d'];
}

@Component({selector: 'my-comp', template: ''})
class MyCompBroken0 {
}

@Component({selector: 'manual-projecting', template: '<div #vc></div>'})
class ManualProjecting {
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  @ViewChild('vc', {read: ViewContainerRef})
  vc: ViewContainerRef;

  @ContentChildren(TextDirective)
  query: QueryList<TextDirective>;

  create() { this.vc.createEmbeddedView(this.template); }

  destroy() { this.vc.clear(); }
}
