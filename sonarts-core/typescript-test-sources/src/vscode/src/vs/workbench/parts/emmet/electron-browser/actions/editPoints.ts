/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import nls = require('vs/nls');
import { BasicEmmetEditorAction } from 'vs/workbench/parts/emmet/electron-browser/emmetActions';

import { editorAction } from 'vs/editor/common/editorCommonExtensions';

@editorAction
class PreviousEditPointAction extends BasicEmmetEditorAction {
	constructor() {
		super(
			'editor.emmet.action.previousEditPoint',
			nls.localize('previousEditPoint', "Emmet: Previous Edit Point"),
			'Emmet: Previous Edit Point',
			'prev_edit_point'
		);
	}
}

@editorAction
class NextEditPointAction extends BasicEmmetEditorAction {
	constructor() {
		super(
			'editor.emmet.action.nextEditPoint',
			nls.localize('nextEditPoint', "Emmet: Next Edit Point"),
			'Emmet: Next Edit Point',
			'next_edit_point'
		);
	}
}
