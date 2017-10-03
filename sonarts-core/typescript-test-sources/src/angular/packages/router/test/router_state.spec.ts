/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, equalParamsAndUrlSegments} from '../src/router_state';
import {Params} from '../src/shared';
import {UrlSegment} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';

describe('RouterState & Snapshot', () => {
  describe('RouterStateSnapshot', () => {
    let state: RouterStateSnapshot;
    let a: ActivatedRouteSnapshot;
    let b: ActivatedRouteSnapshot;
    let c: ActivatedRouteSnapshot;

    beforeEach(() => {
      a = createActivatedRouteSnapshot('a');
      b = createActivatedRouteSnapshot('b');
      c = createActivatedRouteSnapshot('c');

      const root = new TreeNode(a, [new TreeNode(b, []), new TreeNode(c, [])]);

      state = new RouterStateSnapshot('url', root);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild !;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild !;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild !;
      const p = b.pathFromRoot;
      expect(p[0]).toBe(state.root);
      expect(p[1]).toBe(b);
    });
  });

  describe('RouterState', () => {
    let state: RouterState;
    let a: ActivatedRoute;
    let b: ActivatedRoute;
    let c: ActivatedRoute;

    beforeEach(() => {
      a = createActivatedRoute('a');
      b = createActivatedRoute('b');
      c = createActivatedRoute('c');

      const root = new TreeNode(a, [new TreeNode(b, []), new TreeNode(c, [])]);

      state = new RouterState(root, <any>null);
    });

    it('should return first child', () => { expect(state.root.firstChild).toBe(b); });

    it('should return children', () => {
      const cc = state.root.children;
      expect(cc[0]).toBe(b);
      expect(cc[1]).toBe(c);
    });

    it('should return root', () => {
      const b = state.root.firstChild !;
      expect(b.root).toBe(state.root);
    });

    it('should return parent', () => {
      const b = state.root.firstChild !;
      expect(b.parent).toBe(state.root);
    });

    it('should return path from root', () => {
      const b = state.root.firstChild !;
      const p = b.pathFromRoot;
      expect(p[0]).toBe(state.root);
      expect(p[1]).toBe(b);
    });
  });

  describe('equalParamsAndUrlSegments', () => {
    function createSnapshot(params: Params, url: UrlSegment[]): ActivatedRouteSnapshot {
      const snapshot = new ActivatedRouteSnapshot(
          url, params, <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>null,
          -1, null !);
      snapshot._routerState = new RouterStateSnapshot('', new TreeNode(snapshot, []));
      return snapshot;
    }

    function createSnapshotPairWithParent(
        params: [Params, Params], parentParams: [Params, Params],
        urls: [string, string]): [ActivatedRouteSnapshot, ActivatedRouteSnapshot] {
      const snapshot1 = createSnapshot(params[0], []);
      const snapshot2 = createSnapshot(params[1], []);

      const snapshot1Parent = createSnapshot(parentParams[0], [new UrlSegment(urls[0], {})]);
      const snapshot2Parent = createSnapshot(parentParams[1], [new UrlSegment(urls[1], {})]);

      snapshot1._routerState =
          new RouterStateSnapshot('', new TreeNode(snapshot1Parent, [new TreeNode(snapshot1, [])]));
      snapshot2._routerState =
          new RouterStateSnapshot('', new TreeNode(snapshot2Parent, [new TreeNode(snapshot2, [])]));

      return [snapshot1, snapshot2];
    }

    it('should return false when params are different', () => {
      expect(equalParamsAndUrlSegments(createSnapshot({a: 1}, []), createSnapshot({a: 2}, [])))
          .toEqual(false);
    });

    it('should return false when urls are different', () => {
      expect(equalParamsAndUrlSegments(
                 createSnapshot({a: 1}, [new UrlSegment('a', {})]),
                 createSnapshot({a: 1}, [new UrlSegment('b', {})])))
          .toEqual(false);
    });

    it('should return true othewise', () => {
      expect(equalParamsAndUrlSegments(
                 createSnapshot({a: 1}, [new UrlSegment('a', {})]),
                 createSnapshot({a: 1}, [new UrlSegment('a', {})])))
          .toEqual(true);
    });

    it('should return false when upstream params are different', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {c: 1}], ['a', 'a']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(false);
    });

    it('should return false when upstream urls are different', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {b: 1}], ['a', 'b']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(false);
    });

    it('should return true when upstream urls and params are equal', () => {
      const [snapshot1, snapshot2] =
          createSnapshotPairWithParent([{a: 1}, {a: 1}], [{b: 1}, {b: 1}], ['a', 'a']);

      expect(equalParamsAndUrlSegments(snapshot1, snapshot2)).toEqual(true);
    });
  });

  describe('advanceActivatedRoute', () => {

    let route: ActivatedRoute;

    beforeEach(() => { route = createActivatedRoute('a'); });

    function createSnapshot(params: Params, url: UrlSegment[]): ActivatedRouteSnapshot {
      const queryParams = {};
      const fragment = '';
      const data = {};
      const snapshot = new ActivatedRouteSnapshot(
          url, params, queryParams, fragment, data, <any>null, <any>null, <any>null, <any>null, -1,
          null !);
      const state = new RouterStateSnapshot('', new TreeNode(snapshot, []));
      snapshot._routerState = state;
      return snapshot;
    }

    it('should call change observers', () => {
      const firstPlace = createSnapshot({a: 1}, []);
      const secondPlace = createSnapshot({a: 2}, []);
      route.snapshot = firstPlace;
      route._futureSnapshot = secondPlace;

      let hasSeenDataChange = false;
      route.data.forEach((data) => { hasSeenDataChange = true; });
      advanceActivatedRoute(route);
      expect(hasSeenDataChange).toEqual(true);
    });
  });
});

function createActivatedRouteSnapshot(cmp: string) {
  return new ActivatedRouteSnapshot(
      <any>null, <any>null, <any>null, <any>null, <any>null, <any>null, <any>cmp, <any>null,
      <any>null, -1, null !);
}

function createActivatedRoute(cmp: string) {
  return new ActivatedRoute(
      new BehaviorSubject([new UrlSegment('', {})]), new BehaviorSubject({}), <any>null, <any>null,
      new BehaviorSubject({}), <any>null, <any>cmp, <any>null);
}
