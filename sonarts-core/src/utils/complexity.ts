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
import { is, FUNCTION_LIKE, functionLikeMainToken } from "../utils/navigation";

export function getFunctionComplexityNodes(functionNode: ts.FunctionLikeDeclaration): ts.Node[] {
  return getComplexityNodes(functionNode, true);
}

export function getOverallComplexity(node: ts.Node): ts.Node[] {
  return getComplexityNodes(node, false);
}

function getComplexityNodes(rootNode: ts.Node, skipFunctions: boolean): ts.Node[] {
  const complexityNodes: ts.Node[] = [];

  const visitNode = (node: ts.Node) => {
    if (is(node, ...FUNCTION_LIKE)) {
      if (skipFunctions && node !== rootNode) {
        return;
      } else {
        complexityNodes.push(functionLikeMainToken(node as ts.FunctionLikeDeclaration));
      }
    }

    switch (node.kind) {
      case ts.SyntaxKind.ConditionalExpression:
        complexityNodes.push((node as ts.ConditionalExpression).questionToken);
        break;
      // for, for-in, for-of
      case ts.SyntaxKind.ForKeyword:
      case ts.SyntaxKind.DoKeyword:
      case ts.SyntaxKind.IfKeyword:
      case ts.SyntaxKind.CaseKeyword:
        complexityNodes.push(node);
        break;
      case ts.SyntaxKind.WhileStatement:
        complexityNodes.push((node as ts.WhileStatement).getFirstToken());
        break;
      case ts.SyntaxKind.BinaryExpression:
        const binaryExpression = node as ts.BinaryExpression;
        if (is(binaryExpression.operatorToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken)) {
          complexityNodes.push(binaryExpression.operatorToken);
        }
        break;
    }

    node.getChildren().forEach(visitNode);
  };

  visitNode(rootNode);

  return complexityNodes;
}
