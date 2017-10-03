/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TextAreaInput, ITextAreaInputHost } from 'vs/editor/browser/controller/textAreaInput';
import { ISimpleModel, TextAreaState, IENarratorStrategy, NVDAPagedStrategy } from 'vs/editor/browser/controller/textAreaState';
import { Range, IRange } from 'vs/editor/common/core/range';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { createFastDomNode } from 'vs/base/browser/fastDomNode';
import * as browser from 'vs/base/browser/browser';

// To run this test, open imeTester.html

const enum TextAreaStrategy {
	IENarrator,
	NVDA
}

class SingleLineTestModel implements ISimpleModel {

	private _line: string;
	private _eol: string;

	constructor(line: string) {
		this._line = line;
		this._eol = '\n';
	}

	_setText(text: string) {
		this._line = text;
	}

	getLineMaxColumn(lineNumber: number): number {
		return this._line.length + 1;
	}

	getValueInRange(range: IRange, eol: editorCommon.EndOfLinePreference): string {
		return this._line.substring(range.startColumn - 1, range.endColumn - 1);
	}

	getModelLineContent(lineNumber: number): string {
		return this._line;
	}

	getLineCount(): number {
		return 1;
	}
}

class TestView {

	private _model: SingleLineTestModel;

	constructor(model: SingleLineTestModel) {
		this._model = model;
	}

	public paint(output: HTMLElement) {
		let r = '';
		for (let i = 1; i <= this._model.getLineCount(); i++) {
			let content = this._model.getModelLineContent(i);
			r += content + '<br/>';
		}
		output.innerHTML = r;
	}
}

function doCreateTest(strategy: TextAreaStrategy, description: string, inputStr: string, expectedStr: string): HTMLElement {
	let cursorOffset: number = 0;
	let cursorLength: number = 0;

	let container = document.createElement('div');
	container.className = 'container';

	let title = document.createElement('div');
	title.className = 'title';

	const toStr = (value: TextAreaStrategy): string => {
		if (value === TextAreaStrategy.IENarrator) {
			return 'IENarrator';
		}
		if (value === TextAreaStrategy.NVDA) {
			return 'NVDA';
		}
		return '???';
	};

	title.innerHTML = toStr(strategy) + ' strategy: ' + description + '. Type <strong>' + inputStr + '</strong>';
	container.appendChild(title);

	let startBtn = document.createElement('button');
	startBtn.innerHTML = 'Start';
	container.appendChild(startBtn);


	let input = document.createElement('textarea');
	input.setAttribute('rows', '10');
	input.setAttribute('cols', '40');
	container.appendChild(input);

	let model = new SingleLineTestModel('some  text');

	const textAreaInputHost: ITextAreaInputHost = {
		getPlainTextToCopy: (): string => '',
		getHTMLToCopy: (): string => '',
		getScreenReaderContent: (currentState: TextAreaState): TextAreaState => {

			if (browser.isIPad) {
				// Do not place anything in the textarea for the iPad
				return TextAreaState.EMPTY;
			}

			const selection = new Range(1, 1 + cursorOffset, 1, 1 + cursorOffset + cursorLength);

			if (strategy === TextAreaStrategy.IENarrator) {
				return IENarratorStrategy.fromEditorSelection(currentState, model, selection);
			}

			return NVDAPagedStrategy.fromEditorSelection(currentState, model, selection);
		}
	};

	let handler = new TextAreaInput(textAreaInputHost, createFastDomNode(input));

	let output = document.createElement('pre');
	output.className = 'output';
	container.appendChild(output);

	let check = document.createElement('pre');
	check.className = 'check';
	container.appendChild(check);

	let br = document.createElement('br');
	br.style.clear = 'both';
	container.appendChild(br);

	let view = new TestView(model);

	let updatePosition = (off: number, len: number) => {
		cursorOffset = off;
		cursorLength = len;
		handler.writeScreenReaderContent('selection changed');
		handler.focusTextArea();
	};

	let updateModelAndPosition = (text: string, off: number, len: number) => {
		model._setText(text);
		updatePosition(off, len);
		view.paint(output);

		let expected = 'some ' + expectedStr + ' text';
		if (text === expected) {
			check.innerHTML = '[GOOD]';
			check.className = 'check good';
		} else {
			check.innerHTML = '[BAD]';
			check.className = 'check bad';
		}
		check.innerHTML += expected;
	};

	handler.onType((e) => {
		console.log('type text: ' + e.text + ', replaceCharCnt: ' + e.replaceCharCnt);
		let text = model.getModelLineContent(1);
		let preText = text.substring(0, cursorOffset - e.replaceCharCnt);
		let postText = text.substring(cursorOffset + cursorLength);
		let midText = e.text;

		updateModelAndPosition(preText + midText + postText, (preText + midText).length, 0);
	});

	view.paint(output);

	startBtn.onclick = function () {
		updateModelAndPosition('some  text', 5, 0);
		input.focus();
	};

	return container;
}

const TESTS = [
	{ description: 'Japanese IME 1', in: 'sennsei [Enter]', out: 'せんせい' },
	{ description: 'Japanese IME 2', in: 'konnichiha [Enter]', out: 'こんいちは' },
	{ description: 'Japanese IME 3', in: 'mikann [Enter]', out: 'みかん' },
	{ description: 'Korean IME 1', in: 'gksrmf [Space]', out: '한글 ' },
	{ description: 'Chinese IME 1', in: '.,', out: '。，' },
	{ description: 'Chinese IME 2', in: 'ni [Space] hao [Space]', out: '你好' },
	{ description: 'Chinese IME 3', in: 'hazni [Space]', out: '哈祝你' },
	{ description: 'Mac dead key 1', in: '`.', out: '`.' },
	{ description: 'Mac hold key 1', in: 'e long press and 1', out: 'é' }
];

TESTS.forEach((t) => {
	document.body.appendChild(doCreateTest(TextAreaStrategy.NVDA, t.description, t.in, t.out));
	document.body.appendChild(doCreateTest(TextAreaStrategy.IENarrator, t.description, t.in, t.out));
});