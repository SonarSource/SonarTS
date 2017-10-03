/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {DetachedRouteHandleInternal, RouteReuseStrategy} from './route_reuse_strategy';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
import {TreeNode} from './utils/tree';

export function createRouterState(
    routeReuseStrategy: RouteReuseStrategy, curr: RouterStateSnapshot,
    prevState: RouterState): RouterState {
  const root = createNode(routeReuseStrategy, curr._root, prevState ? prevState._root : undefined);
  return new RouterState(root, curr);
}

function createNode(
    routeReuseStrategy: RouteReuseStrategy, curr: TreeNode<ActivatedRouteSnapshot>,
    prevState?: TreeNode<ActivatedRoute>): TreeNode<ActivatedRoute> {
  // reuse an activated route that is currently displayed on the screen
  if (prevState && routeReuseStrategy.shouldReuseRoute(curr.value, prevState.value.snapshot)) {
    const value = prevState.value;
    value._futureSnapshot = curr.value;
    const children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
    return new TreeNode<ActivatedRoute>(value, children);

    // retrieve an activated route that is used to be displayed, but is not currently displayed
  } else if (routeReuseStrategy.retrieve(curr.value)) {
    const tree: TreeNode<ActivatedRoute> =
        (<DetachedRouteHandleInternal>routeReuseStrategy.retrieve(curr.value)).route;
    setFutureSnapshotsOfActivatedRoutes(curr, tree);
    return tree;

  } else {
    const value = createActivatedRoute(curr.value);
    const children = curr.children.map(c => createNode(routeReuseStrategy, c));
    return new TreeNode<ActivatedRoute>(value, children);
  }
}

function setFutureSnapshotsOfActivatedRoutes(
    curr: TreeNode<ActivatedRouteSnapshot>, result: TreeNode<ActivatedRoute>): void {
  if (curr.value.routeConfig !== result.value.routeConfig) {
    throw new Error('Cannot reattach ActivatedRouteSnapshot created from a different route');
  }
  if (curr.children.length !== result.children.length) {
    throw new Error('Cannot reattach ActivatedRouteSnapshot with a different number of children');
  }
  result.value._futureSnapshot = curr.value;
  for (let i = 0; i < curr.children.length; ++i) {
    setFutureSnapshotsOfActivatedRoutes(curr.children[i], result.children[i]);
  }
}

function createOrReuseChildren(
    routeReuseStrategy: RouteReuseStrategy, curr: TreeNode<ActivatedRouteSnapshot>,
    prevState: TreeNode<ActivatedRoute>) {
  return curr.children.map(child => {
    for (const p of prevState.children) {
      if (routeReuseStrategy.shouldReuseRoute(p.value.snapshot, child.value)) {
        return createNode(routeReuseStrategy, child, p);
      }
    }
    return createNode(routeReuseStrategy, child);
  });
}

function createActivatedRoute(c: ActivatedRouteSnapshot) {
  return new ActivatedRoute(
      new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams),
      new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}