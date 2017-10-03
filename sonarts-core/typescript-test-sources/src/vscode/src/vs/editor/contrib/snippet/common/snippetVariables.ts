/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { basename, dirname, normalize } from 'vs/base/common/paths';
import { ICommonCodeEditor, IModel } from 'vs/editor/common/editorCommon';
import { Selection } from 'vs/editor/common/core/selection';
import { ISnippetVariableResolver } from './snippet';


export class EditorSnippetVariableResolver {

	constructor(
		private readonly _model: IModel,
		private readonly _selection: Selection
	) {
		//
	}

	resolve(name: string): string {
		if (name === 'SELECTION' || name === 'TM_SELECTED_TEXT') {
			return this._model.getValueInRange(this._selection);

		} else if (name === 'TM_CURRENT_LINE') {
			return this._model.getLineContent(this._selection.positionLineNumber);

		} else if (name === 'TM_CURRENT_WORD') {
			const info = this._model.getWordAtPosition({
				lineNumber: this._selection.positionLineNumber,
				column: this._selection.positionColumn
			});
			return info ? info.word : '';

		} else if (name === 'TM_LINE_INDEX') {
			return String(this._selection.positionLineNumber - 1);

		} else if (name === 'TM_LINE_NUMBER') {
			return String(this._selection.positionLineNumber);

		} else if (name === 'TM_FILENAME') {
			return basename(this._model.uri.fsPath);

		} else if (name === 'TM_DIRECTORY') {
			const dir = dirname(this._model.uri.fsPath);
			return dir !== '.' ? dir : '';

		} else if (name === 'TM_FILEPATH') {
			return this._model.uri.fsPath;

		} else {
			return undefined;
		}
	}
}

export class SnippetVariablesResolver implements ISnippetVariableResolver {

	private readonly _editor: ICommonCodeEditor;

	constructor(editor: ICommonCodeEditor) {
		this._editor = editor;
	}

	resolve(name: string): string {
		const model = this._editor.getModel();
		if (!model) {
			throw new Error();
		}
		switch (name) {
			case 'SELECTION':
			case 'TM_SELECTED_TEXT': return this._tmSelectedText();
			case 'TM_CURRENT_LINE': return this._tmCurrentLine();
			case 'TM_CURRENT_WORD': return this._tmCurrentWord();
			case 'TM_LINE_INDEX': return this._tmLineIndex();
			case 'TM_LINE_NUMBER': return this._tmLineNumber();
			case 'TM_FILENAME': return this._tmFilename();
			case 'TM_DIRECTORY': return this._tmDirectory();
			case 'TM_FILEPATH': return this._tmFilepath();
		}
		return undefined;
	}

	private _tmCurrentLine(): string {
		const { positionLineNumber } = this._editor.getSelection();
		return this._editor.getModel().getValueInRange({ startLineNumber: positionLineNumber, startColumn: 1, endLineNumber: positionLineNumber, endColumn: Number.MAX_VALUE });
	}

	private _tmCurrentWord(): string {
		const word = this._editor.getModel().getWordAtPosition(this._editor.getPosition());
		return word ? word.word : '';
	}

	private _tmFilename(): string {
		return basename(this._editor.getModel().uri.fsPath);
	}

	private _tmDirectory(): string {
		const dir = dirname(normalize(this._editor.getModel().uri.fsPath));
		return dir !== '.' ? dir : '';
	}

	private _tmFilepath(): string {
		return this._editor.getModel().uri.fsPath;
	}

	private _tmLineIndex(): string {
		return String(this._editor.getSelection().positionLineNumber - 1);
	}

	private _tmLineNumber(): string {
		return String(this._editor.getSelection().positionLineNumber);
	}

	private _tmSelectedText(): string {
		return this._editor.getModel().getValueInRange(this._editor.getSelection());
	}
}
