/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { ISimpleModel, TextAreaState, ITextAreaWrapper, IENarratorStrategy } from 'vs/editor/browser/controller/textAreaState';
import { Range } from 'vs/editor/common/core/range';
import { EndOfLinePreference } from 'vs/editor/common/editorCommon';
import { Disposable } from 'vs/base/common/lifecycle';

export class MockTextAreaWrapper extends Disposable implements ITextAreaWrapper {

	public _value: string;
	public _selectionStart: number;
	public _selectionEnd: number;

	constructor() {
		super();
		this._value = '';
		this._selectionStart = 0;
		this._selectionEnd = 0;
	}

	public getValue(): string {
		return this._value;
	}

	public setValue(reason: string, value: string): void {
		this._value = value;
		this._selectionStart = this._value.length;
		this._selectionEnd = this._value.length;
	}

	public getSelectionStart(): number {
		return this._selectionStart;
	}

	public getSelectionEnd(): number {
		return this._selectionEnd;
	}

	public setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void {
		if (selectionStart < 0) {
			selectionStart = 0;
		}
		if (selectionStart > this._value.length) {
			selectionStart = this._value.length;
		}
		if (selectionEnd < 0) {
			selectionEnd = 0;
		}
		if (selectionEnd > this._value.length) {
			selectionEnd = this._value.length;
		}
		this._selectionStart = selectionStart;
		this._selectionEnd = selectionEnd;
	}
}

suite('TextAreaState', () => {

	function assertTextAreaState(actual: TextAreaState, value: string, selectionStart: number, selectionEnd: number, selectionToken: number): void {
		let desired = new TextAreaState(value, selectionStart, selectionEnd, selectionToken);
		assert.ok(desired.equals(actual), desired.toString() + ' == ' + actual.toString());
	}

	test('fromTextArea', () => {
		let textArea = new MockTextAreaWrapper();
		textArea._value = 'Hello world!';
		textArea._selectionStart = 1;
		textArea._selectionEnd = 12;
		let actual = TextAreaState.EMPTY.readFromTextArea(textArea);

		assertTextAreaState(actual, 'Hello world!', 1, 12, 0);
		assert.equal(actual.value, 'Hello world!');
		assert.equal(actual.selectionStart, 1);

		actual = actual.collapseSelection();
		assertTextAreaState(actual, 'Hello world!', 12, 12, 0);

		textArea.dispose();
	});

	test('applyToTextArea', () => {
		let textArea = new MockTextAreaWrapper();
		textArea._value = 'Hello world!';
		textArea._selectionStart = 1;
		textArea._selectionEnd = 12;

		let state = new TextAreaState('Hi world!', 2, 2, 0);
		state.writeToTextArea('test', textArea, false);

		assert.equal(textArea._value, 'Hi world!');
		assert.equal(textArea._selectionStart, 9);
		assert.equal(textArea._selectionEnd, 9);

		state = new TextAreaState('Hi world!', 3, 3, 0);
		state.writeToTextArea('test', textArea, false);

		assert.equal(textArea._value, 'Hi world!');
		assert.equal(textArea._selectionStart, 9);
		assert.equal(textArea._selectionEnd, 9);

		state = new TextAreaState('Hi world!', 0, 2, 0);
		state.writeToTextArea('test', textArea, true);

		assert.equal(textArea._value, 'Hi world!');
		assert.equal(textArea._selectionStart, 0);
		assert.equal(textArea._selectionEnd, 2);

		textArea.dispose();
	});

	function testDeduceInput(prevState: TextAreaState, value: string, selectionStart: number, selectionEnd: number, expected: string, expectedCharReplaceCnt: number): void {
		prevState = prevState || TextAreaState.EMPTY;

		let textArea = new MockTextAreaWrapper();
		textArea._value = value;
		textArea._selectionStart = selectionStart;
		textArea._selectionEnd = selectionEnd;

		let newState = prevState.readFromTextArea(textArea);
		let actual = TextAreaState.deduceInput(prevState, newState, true);

		assert.equal(actual.text, expected);
		assert.equal(actual.replaceCharCnt, expectedCharReplaceCnt);

		textArea.dispose();
	}

	test('deduceInput - Japanese typing sennsei and accepting', () => {
		// manual test:
		// - choose keyboard layout: Japanese -> Hiragama
		// - type sennsei
		// - accept with Enter
		// - expected: せんせい

		// s
		// PREVIOUS STATE: [ <>, selectionStart: 0, selectionEnd: 0, selectionToken: 0]
		// CURRENT STATE: [ <ｓ>, selectionStart: 0, selectionEnd: 1, selectionToken: 0]
		testDeduceInput(
			TextAreaState.EMPTY,
			'ｓ',
			0, 1,
			'ｓ', 0
		);

		// e
		// PREVIOUS STATE: [ <ｓ>, selectionStart: 0, selectionEnd: 1, selectionToken: 0]
		// CURRENT STATE: [ <せ>, selectionStart: 0, selectionEnd: 1, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('ｓ', 0, 1, 0),
			'せ',
			0, 1,
			'せ', 1
		);

		// n
		// PREVIOUS STATE: [ <せ>, selectionStart: 0, selectionEnd: 1, selectionToken: 0]
		// CURRENT STATE: [ <せｎ>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せ', 0, 1, 0),
			'せｎ',
			0, 2,
			'せｎ', 1
		);

		// n
		// PREVIOUS STATE: [ <せｎ>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		// CURRENT STATE: [ <せん>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せｎ', 0, 2, 0),
			'せん',
			0, 2,
			'せん', 2
		);

		// s
		// PREVIOUS STATE: [ <せん>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		// CURRENT STATE: [ <せんｓ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せん', 0, 2, 0),
			'せんｓ',
			0, 3,
			'せんｓ', 2
		);

		// e
		// PREVIOUS STATE: [ <せんｓ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		// CURRENT STATE: [ <せんせ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんｓ', 0, 3, 0),
			'せんせ',
			0, 3,
			'せんせ', 3
		);

		// no-op? [was recorded]
		// PREVIOUS STATE: [ <せんせ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		// CURRENT STATE: [ <せんせ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんせ', 0, 3, 0),
			'せんせ',
			0, 3,
			'せんせ', 3
		);

		// i
		// PREVIOUS STATE: [ <せんせ>, selectionStart: 0, selectionEnd: 3, selectionToken: 0]
		// CURRENT STATE: [ <せんせい>, selectionStart: 0, selectionEnd: 4, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんせ', 0, 3, 0),
			'せんせい',
			0, 4,
			'せんせい', 3
		);

		// ENTER (accept)
		// PREVIOUS STATE: [ <せんせい>, selectionStart: 0, selectionEnd: 4, selectionToken: 0]
		// CURRENT STATE: [ <せんせい>, selectionStart: 4, selectionEnd: 4, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんせい', 0, 4, 0),
			'せんせい',
			4, 4,
			'', 0
		);
	});

	test('deduceInput - Japanese typing sennsei and choosing different suggestion', () => {
		// manual test:
		// - choose keyboard layout: Japanese -> Hiragama
		// - type sennsei
		// - arrow down (choose next suggestion)
		// - accept with Enter
		// - expected: せんせい

		// sennsei
		// PREVIOUS STATE: [ <せんせい>, selectionStart: 0, selectionEnd: 4, selectionToken: 0]
		// CURRENT STATE: [ <せんせい>, selectionStart: 0, selectionEnd: 4, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんせい', 0, 4, 0),
			'せんせい',
			0, 4,
			'せんせい', 4
		);

		// arrow down
		// CURRENT STATE: [ <先生>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		// PREVIOUS STATE: [ <せんせい>, selectionStart: 0, selectionEnd: 4, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('せんせい', 0, 4, 0),
			'先生',
			0, 2,
			'先生', 4
		);

		// ENTER (accept)
		// PREVIOUS STATE: [ <先生>, selectionStart: 0, selectionEnd: 2, selectionToken: 0]
		// CURRENT STATE: [ <先生>, selectionStart: 2, selectionEnd: 2, selectionToken: 0]
		testDeduceInput(
			new TextAreaState('先生', 0, 2, 0),
			'先生',
			2, 2,
			'', 0
		);
	});

	test('extractNewText - no previous state with selection', () => {
		testDeduceInput(
			null,
			'a',
			0, 1,
			'a', 0
		);
	});

	test('issue #2586: Replacing selected end-of-line with newline locks up the document', () => {
		testDeduceInput(
			new TextAreaState(']\n', 1, 2, 0),
			']\n',
			2, 2,
			'\n', 0
		);
	});

	test('extractNewText - no previous state without selection', () => {
		testDeduceInput(
			null,
			'a',
			1, 1,
			'a', 0
		);
	});

	test('extractNewText - typing does not cause a selection', () => {
		testDeduceInput(
			TextAreaState.EMPTY,
			'a',
			0, 1,
			'a', 0
		);
	});

	test('extractNewText - had the textarea empty', () => {
		testDeduceInput(
			TextAreaState.EMPTY,
			'a',
			1, 1,
			'a', 0
		);
	});

	test('extractNewText - had the entire line selected', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 0, 12, 0),
			'H',
			1, 1,
			'H', 0
		);
	});

	test('extractNewText - had previous text 1', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 12, 12, 0),
			'Hello world!a',
			13, 13,
			'a', 0
		);
	});

	test('extractNewText - had previous text 2', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 0, 0, 0),
			'aHello world!',
			1, 1,
			'a', 0
		);
	});

	test('extractNewText - had previous text 3', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 6, 11, 0),
			'Hello other!',
			11, 11,
			'other', 0
		);
	});

	test('extractNewText - IME', () => {
		testDeduceInput(
			TextAreaState.EMPTY,
			'これは',
			3, 3,
			'これは', 0
		);
	});

	test('extractNewText - isInOverwriteMode', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 0, 0, 0),
			'Aello world!',
			1, 1,
			'A', 0
		);
	});

	test('extractMacReplacedText - does nothing if there is selection', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 5, 5, 0),
			'Hellö world!',
			4, 5,
			'ö', 0
		);
	});

	test('extractMacReplacedText - does nothing if there is more than one extra char', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 5, 5, 0),
			'Hellöö world!',
			5, 5,
			'öö', 1
		);
	});

	test('extractMacReplacedText - does nothing if there is more than one changed char', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 5, 5, 0),
			'Helöö world!',
			5, 5,
			'öö', 2
		);
	});

	test('extractMacReplacedText', () => {
		testDeduceInput(
			new TextAreaState('Hello world!', 5, 5, 0),
			'Hellö world!',
			5, 5,
			'ö', 1
		);
	});

	test('issue #25101 - First key press ignored', () => {
		testDeduceInput(
			new TextAreaState('a', 0, 1, 0),
			'a',
			1, 1,
			'a', 0
		);
	});

	test('issue #16520 - Cmd-d of single character followed by typing same character as has no effect', () => {
		testDeduceInput(
			new TextAreaState('x x', 0, 1, 0),
			'x x',
			1, 1,
			'x', 0
		);
	});

	test('issue #4271 (example 1) - When inserting an emoji on OSX, it is placed two spaces left of the cursor', () => {
		// The OSX emoji inserter inserts emojis at random positions in the text, unrelated to where the cursor is.
		testDeduceInput(
			new TextAreaState(
				[
					'some1  text',
					'some2  text',
					'some3  text',
					'some4  text', // cursor is here in the middle of the two spaces
					'some5  text',
					'some6  text',
					'some7  text'
				].join('\n'),
				42, 42, 0
			),
			[
				'so📅me1  text',
				'some2  text',
				'some3  text',
				'some4  text',
				'some5  text',
				'some6  text',
				'some7  text'
			].join('\n'),
			4, 4,
			'📅', 0
		);
	});

	test('issue #4271 (example 2) - When inserting an emoji on OSX, it is placed two spaces left of the cursor', () => {
		// The OSX emoji inserter inserts emojis at random positions in the text, unrelated to where the cursor is.
		testDeduceInput(
			new TextAreaState(
				'some1  text',
				6, 6, 0
			),
			'some💊1  text',
			6, 6,
			'💊', 0
		);
	});

	test('issue #4271 (example 3) - When inserting an emoji on OSX, it is placed two spaces left of the cursor', () => {
		// The OSX emoji inserter inserts emojis at random positions in the text, unrelated to where the cursor is.
		testDeduceInput(
			new TextAreaState(
				'qwertyu\nasdfghj\nzxcvbnm',
				12, 12, 0
			),
			'qwertyu\nasdfghj\nzxcvbnm🎈',
			25, 25,
			'🎈', 0
		);
	});

	// an example of an emoji missed by the regex but which has the FE0F variant 16 hint
	test('issue #4271 (example 4) - When inserting an emoji on OSX, it is placed two spaces left of the cursor', () => {
		// The OSX emoji inserter inserts emojis at random positions in the text, unrelated to where the cursor is.
		testDeduceInput(
			new TextAreaState(
				'some1  text',
				6, 6, 0
			),
			'some⌨️1  text',
			6, 6,
			'⌨️', 0
		);
	});

	function testFromEditorSelectionAndPreviousState(eol: string, lines: string[], range: Range, prevSelectionToken: number): TextAreaState {
		let model = new SimpleModel(lines, eol);
		let previousState = new TextAreaState('', 0, 0, prevSelectionToken);
		return IENarratorStrategy.fromEditorSelection(previousState, model, range);
	}

	test('fromEditorSelectionAndPreviousState - no selection on first line', () => {
		let actual = testFromEditorSelectionAndPreviousState('\n', [
			'Just a line',
			'And another line'
		], new Range(1, 1, 1, 1), 0);
		assertTextAreaState(actual, 'Just a line', 0, 11, 1);
	});

	test('fromEditorSelectionAndPreviousState - no selection on second line', () => {
		let actual = testFromEditorSelectionAndPreviousState('\n', [
			'Just a line',
			'And another line',
			'And yet another line',
		], new Range(2, 1, 2, 1), 0);
		assertTextAreaState(actual, 'And another line', 0, 16, 2);
	});

	test('fromEditorSelectionAndPreviousState - on a long line with selectionToken mismatch', () => {
		let aLongLine = 'a';
		for (let i = 0; i < 10; i++) {
			aLongLine = aLongLine + aLongLine;
		}
		let actual = testFromEditorSelectionAndPreviousState('\n', [
			'Just a line',
			aLongLine,
			'And yet another line',
		], new Range(2, 500, 2, 500), 0);
		assertTextAreaState(actual, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa…aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 0, 201, 2);
	});

	test('fromEditorSelectionAndPreviousState - on a long line with same selectionToken', () => {
		let aLongLine = 'a';
		for (let i = 0; i < 10; i++) {
			aLongLine = aLongLine + aLongLine;
		}
		let actual = testFromEditorSelectionAndPreviousState('\n', [
			'Just a line',
			aLongLine,
			'And yet another line',
		], new Range(2, 500, 2, 500), 2);
		assertTextAreaState(actual, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 100, 100, 2);
	});
});

class SimpleModel implements ISimpleModel {

	private _lines: string[];
	private _eol: string;

	constructor(lines: string[], eol: string) {
		this._lines = lines;
		this._eol = eol;
	}

	public getLineMaxColumn(lineNumber: number): number {
		return this._lines[lineNumber - 1].length + 1;
	}

	private _getEndOfLine(eol: EndOfLinePreference): string {
		switch (eol) {
			case EndOfLinePreference.LF:
				return '\n';
			case EndOfLinePreference.CRLF:
				return '\r\n';
			case EndOfLinePreference.TextDefined:
				return this._eol;
		}
		throw new Error('Unknown EOL preference');
	}

	public getValueInRange(range: Range, eol: EndOfLinePreference): string {
		if (Range.isEmpty(range)) {
			return '';
		}

		if (range.startLineNumber === range.endLineNumber) {
			return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
		}

		var lineEnding = this._getEndOfLine(eol),
			startLineIndex = range.startLineNumber - 1,
			endLineIndex = range.endLineNumber - 1,
			resultLines: string[] = [];

		resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
		for (var i = startLineIndex + 1; i < endLineIndex; i++) {
			resultLines.push(this._lines[i]);
		}
		resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));

		return resultLines.join(lineEnding);
	}

	public getLineCount(): number {
		return this._lines.length;
	}
}
