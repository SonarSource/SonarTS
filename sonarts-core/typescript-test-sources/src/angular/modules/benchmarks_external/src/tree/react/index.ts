/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tree benchmark in React
import {getIntParameter, bindAction} from '@angular/testing/src/benchmark_util';
import * as React from './react.min';

const TreeComponent = React.createClass({
  displayName: 'TreeComponent',

  render: function() {
    const treeNode = this.props.treeNode;

    let left = null;
    if (treeNode.left) {
      left = React.createElement(
          "span", {}, [React.createElement(TreeComponent, {treeNode: treeNode.left}, "")]);
    }

    let right = null;
    if (treeNode.right) {
      right = React.createElement(
          "span", {}, [React.createElement(TreeComponent, {treeNode: treeNode.right}, "")]);
    }

    const span = React.createElement("span", {}, [" " + treeNode.value, left, right]);

    return (React.createElement("tree", {}, [span]));
  }
});

export function main() {
  let count = 0;
  const maxDepth = getIntParameter('depth');

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);

  const empty = new TreeNode(0, null, null);
  const rootComponent = React.render(React.createElement(TreeComponent, {treeNode: empty}, ""),
                                   document.getElementById('rootTree'));

  function destroyDom() { rootComponent.setProps({treeNode: empty}); }

  function createDom() {
    const values = count++ % 2 == 0 ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*'] :
                                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '-'];
    rootComponent.setProps({treeNode: buildTree(maxDepth, values, 0)});
  }
}

class TreeNode {
  value: string;
  left: TreeNode;
  right: TreeNode;

  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(maxDepth, values, curDepth) {
  if (maxDepth === curDepth) return new TreeNode('', null, null);
  return new TreeNode(values[curDepth], buildTree(maxDepth, values, curDepth + 1),
                      buildTree(maxDepth, values, curDepth + 1));
}
