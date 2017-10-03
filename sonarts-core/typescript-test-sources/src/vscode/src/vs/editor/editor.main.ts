/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/editor/browser/editor.all';
import 'vs/editor/contrib/quickOpen/browser/quickOutline';
import 'vs/editor/contrib/quickOpen/browser/gotoLine';
import 'vs/editor/contrib/quickOpen/browser/quickCommand';
import 'vs/editor/contrib/inspectTokens/browser/inspectTokens';

import { createMonacoBaseAPI } from 'vs/editor/common/standalone/standaloneBase';
import { createMonacoEditorAPI } from 'vs/editor/browser/standalone/standaloneEditor';
import { createMonacoLanguagesAPI } from 'vs/editor/browser/standalone/standaloneLanguages';
import { EDITOR_DEFAULTS, WrappingIndent } from "vs/editor/common/config/editorOptions";

// Set defaults for standalone editor
EDITOR_DEFAULTS.wrappingIndent = WrappingIndent.None;
(<any>EDITOR_DEFAULTS.contribInfo).folding = false;
(<any>EDITOR_DEFAULTS.viewInfo).glyphMargin = false;

var global: any = self;
global.monaco = createMonacoBaseAPI();
global.monaco.editor = createMonacoEditorAPI();
global.monaco.languages = createMonacoLanguagesAPI();

if (typeof global.require !== 'undefined' && typeof global.require.config === 'function') {
	global.require.config({
		ignoreDuplicateModules: [
			'vscode-languageserver-types',
			'vscode-languageserver-types/main',
		]
	});
}
