/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { renderViewLine, RenderLineInput, CharacterMapping } from 'vs/editor/common/viewLayout/viewLineRenderer';
import { ViewLineToken } from 'vs/editor/common/core/viewLineToken';
import { CharCode } from 'vs/base/common/charCode';
import { MetadataConsts } from 'vs/editor/common/modes';
import { LineDecoration } from 'vs/editor/common/viewLayout/lineDecorations';

suite('viewLineRenderer.renderLine', () => {

	function createPart(endIndex: number, foreground: number): ViewLineToken {
		return new ViewLineToken(endIndex, (
			foreground << MetadataConsts.FOREGROUND_OFFSET
		) >>> 0);
	}

	function assertCharacterReplacement(lineContent: string, tabSize: number, expected: string, expectedCharOffsetInPart: number[][], expectedPartLengts: number[]): void {
		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineContent,
			false,
			0,
			[new ViewLineToken(lineContent.length, 0)],
			[],
			tabSize,
			0,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span><span class="mtk0">' + expected + '</span></span>');
		assertCharacterMapping(_actual.characterMapping, expectedCharOffsetInPart);
		assertPartLengths(_actual.characterMapping, expectedPartLengts);
	}

	test('replaces spaces', () => {
		assertCharacterReplacement(' ', 4, '&nbsp;', [[0, 1]], [1]);
		assertCharacterReplacement('  ', 4, '&nbsp;&nbsp;', [[0, 1, 2]], [2]);
		assertCharacterReplacement('a  b', 4, 'a&nbsp;&nbsp;b', [[0, 1, 2, 3, 4]], [4]);
	});

	test('escapes HTML markup', () => {
		assertCharacterReplacement('a<b', 4, 'a&lt;b', [[0, 1, 2, 3]], [3]);
		assertCharacterReplacement('a>b', 4, 'a&gt;b', [[0, 1, 2, 3]], [3]);
		assertCharacterReplacement('a&b', 4, 'a&amp;b', [[0, 1, 2, 3]], [3]);
	});

	test('replaces some bad characters', () => {
		assertCharacterReplacement('a\0b', 4, 'a&#00;b', [[0, 1, 2, 3]], [3]);
		assertCharacterReplacement('a' + String.fromCharCode(CharCode.UTF8_BOM) + 'b', 4, 'a\ufffdb', [[0, 1, 2, 3]], [3]);
		assertCharacterReplacement('a\u2028b', 4, 'a\ufffdb', [[0, 1, 2, 3]], [3]);
		assertCharacterReplacement('a\rb', 4, 'a&#8203b', [[0, 1, 2, 3]], [3]);
	});

	test('handles tabs', () => {
		assertCharacterReplacement('\t', 4, '&nbsp;&nbsp;&nbsp;&nbsp;', [[0, 4]], [4]);
		assertCharacterReplacement('x\t', 4, 'x&nbsp;&nbsp;&nbsp;', [[0, 1, 4]], [4]);
		assertCharacterReplacement('xx\t', 4, 'xx&nbsp;&nbsp;', [[0, 1, 2, 4]], [4]);
		assertCharacterReplacement('xxx\t', 4, 'xxx&nbsp;', [[0, 1, 2, 3, 4]], [4]);
		assertCharacterReplacement('xxxx\t', 4, 'xxxx&nbsp;&nbsp;&nbsp;&nbsp;', [[0, 1, 2, 3, 4, 8]], [8]);
	});

	function assertParts(lineContent: string, tabSize: number, parts: ViewLineToken[], expected: string, expectedCharOffsetInPart: number[][], expectedPartLengts: number[]): void {
		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineContent,
			false,
			0,
			parts,
			[],
			tabSize,
			0,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expected + '</span>');
		assertCharacterMapping(_actual.characterMapping, expectedCharOffsetInPart);
		assertPartLengths(_actual.characterMapping, expectedPartLengts);
	}

	test('empty line', () => {
		assertParts('', 4, [], '<span>&nbsp;</span>', [], []);
	});

	test('uses part type', () => {
		assertParts('x', 4, [createPart(1, 10)], '<span class="mtk10">x</span>', [[0, 1]], [1]);
		assertParts('x', 4, [createPart(1, 20)], '<span class="mtk20">x</span>', [[0, 1]], [1]);
		assertParts('x', 4, [createPart(1, 30)], '<span class="mtk30">x</span>', [[0, 1]], [1]);
	});

	test('two parts', () => {
		assertParts('xy', 4, [createPart(1, 1), createPart(2, 2)], '<span class="mtk1">x</span><span class="mtk2">y</span>', [[0], [0, 1]], [1, 1]);
		assertParts('xyz', 4, [createPart(1, 1), createPart(3, 2)], '<span class="mtk1">x</span><span class="mtk2">yz</span>', [[0], [0, 1, 2]], [1, 2]);
		assertParts('xyz', 4, [createPart(2, 1), createPart(3, 2)], '<span class="mtk1">xy</span><span class="mtk2">z</span>', [[0, 1], [0, 1]], [2, 1]);
	});

	test('overflow', () => {
		let _actual = renderViewLine(new RenderLineInput(
			false,
			'Hello world!',
			false,
			0,
			[
				createPart(1, 0),
				createPart(2, 1),
				createPart(3, 2),
				createPart(4, 3),
				createPart(5, 4),
				createPart(6, 5),
				createPart(7, 6),
				createPart(8, 7),
				createPart(9, 8),
				createPart(10, 9),
				createPart(11, 10),
				createPart(12, 11),
			],
			[],
			4,
			10,
			6,
			'boundary',
			false,
			false
		));

		let expectedOutput = [
			'<span class="mtk0">H</span>',
			'<span class="mtk1">e</span>',
			'<span class="mtk2">l</span>',
			'<span class="mtk3">l</span>',
			'<span class="mtk4">o</span>',
			'<span class="mtk5">&nbsp;</span>',
			'<span>&hellip;</span>'
		].join('');

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
		assertCharacterMapping(_actual.characterMapping, [
			[0],
			[0],
			[0],
			[0],
			[0],
			[0, 1],
		]);
		assertPartLengths(_actual.characterMapping, [1, 1, 1, 1, 1, 1]);
	});

	test('typical line', () => {
		let lineText = '\t    export class Game { // http://test.com     ';
		let lineParts = [
			createPart(5, 1),
			createPart(11, 2),
			createPart(12, 3),
			createPart(17, 4),
			createPart(18, 5),
			createPart(22, 6),
			createPart(23, 7),
			createPart(24, 8),
			createPart(25, 9),
			createPart(28, 10),
			createPart(43, 11),
			createPart(48, 12),
		];
		let expectedOutput = [
			'<span class="vs-whitespace" style="width:40px">&rarr;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
			'<span class="mtk2">export</span>',
			'<span class="mtk3">&nbsp;</span>',
			'<span class="mtk4">class</span>',
			'<span class="mtk5">&nbsp;</span>',
			'<span class="mtk6">Game</span>',
			'<span class="mtk7">&nbsp;</span>',
			'<span class="mtk8">{</span>',
			'<span class="mtk9">&nbsp;</span>',
			'<span class="mtk10">//&nbsp;</span>',
			'<span class="mtk11">http://test.com</span>',
			'<span class="vs-whitespace" style="width:20px">&middot;&middot;</span>',
			'<span class="vs-whitespace" style="width:30px">&middot;&middot;&middot;</span>'
		].join('');
		let expectedOffsetsArr = [
			[0],
			[0, 1, 2, 3],
			[0, 1, 2, 3, 4, 5],
			[0],
			[0, 1, 2, 3, 4],
			[0],
			[0, 1, 2, 3],
			[0],
			[0],
			[0],
			[0, 1, 2],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
			[0, 1],
			[0, 1, 2, 3],
		];

		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			false,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'boundary',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
		assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr);
		assertPartLengths(_actual.characterMapping, [4, 4, 6, 1, 5, 1, 4, 1, 1, 1, 3, 15, 2, 3]);
	});

	test('issue #2255: Weird line rendering part 1', () => {
		let lineText = '\t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';

		let lineParts = [
			createPart(3, 1), // 3 chars
			createPart(15, 2), // 12 chars
			createPart(21, 3), // 6 chars
			createPart(22, 4), // 1 char
			createPart(43, 5), // 21 chars
			createPart(45, 6), // 2 chars
			createPart(46, 7), // 1 char
			createPart(66, 8), // 20 chars
			createPart(67, 9), // 1 char
			createPart(68, 10), // 2 chars
		];
		let expectedOutput = [
			'<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="mtk2">cursorStyle:</span>',
			'<span class="mtk3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="mtk4">(</span>',
			'<span class="mtk5">prevOpts.cursorStyle&nbsp;</span>',
			'<span class="mtk6">!=</span>',
			'<span class="mtk7">=</span>',
			'<span class="mtk8">&nbsp;newOpts.cursorStyle</span>',
			'<span class="mtk9">)</span>',
			'<span class="mtk10">,</span>',
		].join('');
		let expectedOffsetsArr = [
			[0, 4, 8], // 3 chars
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 12 chars
			[0, 4, 8, 12, 16, 20], // 6 chars
			[0], // 1 char
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], // 21 chars
			[0, 1], // 2 chars
			[0], // 1 char
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // 20 chars
			[0], // 1 char
			[0, 1] // 2 chars
		];

		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			false,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
		assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr);
		assertPartLengths(_actual.characterMapping, [12, 12, 24, 1, 21, 2, 1, 20, 1, 1]);
	});

	test('issue #2255: Weird line rendering part 2', () => {
		let lineText = ' \t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';

		let lineParts = [
			createPart(4, 1), // 4 chars
			createPart(16, 2), // 12 chars
			createPart(22, 3), // 6 chars
			createPart(23, 4), // 1 char
			createPart(44, 5), // 21 chars
			createPart(46, 6), // 2 chars
			createPart(47, 7), // 1 char
			createPart(67, 8), // 20 chars
			createPart(68, 9), // 1 char
			createPart(69, 10), // 2 chars
		];
		let expectedOutput = [
			'<span class="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="mtk2">cursorStyle:</span>',
			'<span class="mtk3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="mtk4">(</span>',
			'<span class="mtk5">prevOpts.cursorStyle&nbsp;</span>',
			'<span class="mtk6">!=</span>',
			'<span class="mtk7">=</span>',
			'<span class="mtk8">&nbsp;newOpts.cursorStyle</span>',
			'<span class="mtk9">)</span>',
			'<span class="mtk10">,</span>',
		].join('');
		let expectedOffsetsArr = [
			[0, 1, 4, 8], // 4 chars
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 12 chars
			[0, 4, 8, 12, 16, 20], // 6 chars
			[0], // 1 char
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], // 21 chars
			[0, 1], // 2 chars
			[0], // 1 char
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // 20 chars
			[0], // 1 char
			[0, 1] // 2 chars
		];

		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			false,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
		assertCharacterMapping(_actual.characterMapping, expectedOffsetsArr);
		assertPartLengths(_actual.characterMapping, [12, 12, 24, 1, 21, 2, 1, 20, 1, 1]);
	});

	test('issue Microsoft/monaco-editor#280: Improved source code rendering for RTL languages', () => {
		let lineText = 'var קודמות = \"מיותר קודמות צ\'ט של, אם לשון העברית שינויים ויש, אם\";';

		let lineParts = [
			createPart(3, 6),
			createPart(13, 1),
			createPart(66, 20),
			createPart(67, 1),
		];

		let expectedOutput = [
			'<span dir="ltr" class="mtk6">var</span>',
			'<span dir="ltr" class="mtk1">&nbsp;קודמות&nbsp;=&nbsp;</span>',
			'<span dir="ltr" class="mtk20">"מיותר&nbsp;קודמות&nbsp;צ\'ט&nbsp;של,&nbsp;אם&nbsp;לשון&nbsp;העברית&nbsp;שינויים&nbsp;ויש,&nbsp;אם"</span>',
			'<span dir="ltr" class="mtk1">;</span>'
		].join('');

		let _actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			true,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
		assert.equal(_actual.containsRTL, true);
	});

	test('issue #6885: Splits large tokens', () => {
		//                                                                                                                  1         1         1
		//                        1         2         3         4         5         6         7         8         9         0         1         2
		//               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
		let _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';

		function assertSplitsTokens(message: string, lineText: string, expectedOutput: string[]): void {
			let lineParts = [createPart(lineText.length, 1)];
			let actual = renderViewLine(new RenderLineInput(
				false,
				lineText,
				false,
				0,
				lineParts,
				[],
				4,
				10,
				-1,
				'none',
				false,
				false
			));
			assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
		}

		// A token with 49 chars
		{
			assertSplitsTokens(
				'49 chars',
				_lineText.substr(0, 49),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;inter</span>',
				]
			);
		}

		// A token with 50 chars
		{
			assertSplitsTokens(
				'50 chars',
				_lineText.substr(0, 50),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;intere</span>',
				]
			);
		}

		// A token with 51 chars
		{
			assertSplitsTokens(
				'51 chars',
				_lineText.substr(0, 51),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;intere</span>',
					'<span class="mtk1">s</span>',
				]
			);
		}

		// A token with 99 chars
		{
			assertSplitsTokens(
				'99 chars',
				_lineText.substr(0, 99),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;intere</span>',
					'<span class="mtk1">sting&nbsp;text.&nbsp;This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contain</span>',
				]
			);
		}

		// A token with 100 chars
		{
			assertSplitsTokens(
				'100 chars',
				_lineText.substr(0, 100),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;intere</span>',
					'<span class="mtk1">sting&nbsp;text.&nbsp;This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains</span>',
				]
			);
		}

		// A token with 101 chars
		{
			assertSplitsTokens(
				'101 chars',
				_lineText.substr(0, 101),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;intere</span>',
					'<span class="mtk1">sting&nbsp;text.&nbsp;This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains</span>',
					'<span class="mtk1">&nbsp;</span>',
				]
			);
		}
	});

	test('issue #21476: Does not split large tokens when ligatures are on', () => {
		//                                                                                                                  1         1         1
		//                        1         2         3         4         5         6         7         8         9         0         1         2
		//               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
		let _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';

		function assertSplitsTokens(message: string, lineText: string, expectedOutput: string[]): void {
			let lineParts = [createPart(lineText.length, 1)];
			let actual = renderViewLine(new RenderLineInput(
				false,
				lineText,
				false,
				0,
				lineParts,
				[],
				4,
				10,
				-1,
				'none',
				false,
				true
			));
			assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
		}

		// A token with 101 chars
		{
			assertSplitsTokens(
				'101 chars',
				_lineText.substr(0, 101),
				[
					'<span class="mtk1">This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;very&nbsp;interesting&nbsp;text.&nbsp;This&nbsp;is&nbsp;just&nbsp;a&nbsp;long&nbsp;line&nbsp;that&nbsp;contains&nbsp;</span>',
				]
			);
		}
	});

	test('issue #20624: Unaligned surrogate pairs are corrupted at multiples of 50 columns', () => {
		let lineText = 'a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷';

		let lineParts = [createPart(lineText.length, 1)];
		let actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			false,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));
		let expectedOutput = [
			'<span class="mtk1">a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
			'<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
			'<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
			'<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
			'<span class="mtk1">𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
		];
		assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>');
	});

	test('issue #6885: Does not split large tokens in RTL text', () => {
		let lineText = 'את גרמנית בהתייחסות שמו, שנתי המשפט אל חפש, אם כתב אחרים ולחבר. של התוכן אודות בויקיפדיה כלל, של עזרה כימיה היא. על עמוד יוצרים מיתולוגיה סדר, אם שכל שתפו לעברית שינויים, אם שאלות אנגלית עזה. שמות בקלות מה סדר.';
		let lineParts = [createPart(lineText.length, 1)];
		let expectedOutput = [
			'<span dir="ltr" class="mtk1">את&nbsp;גרמנית&nbsp;בהתייחסות&nbsp;שמו,&nbsp;שנתי&nbsp;המשפט&nbsp;אל&nbsp;חפש,&nbsp;אם&nbsp;כתב&nbsp;אחרים&nbsp;ולחבר.&nbsp;של&nbsp;התוכן&nbsp;אודות&nbsp;בויקיפדיה&nbsp;כלל,&nbsp;של&nbsp;עזרה&nbsp;כימיה&nbsp;היא.&nbsp;על&nbsp;עמוד&nbsp;יוצרים&nbsp;מיתולוגיה&nbsp;סדר,&nbsp;אם&nbsp;שכל&nbsp;שתפו&nbsp;לעברית&nbsp;שינויים,&nbsp;אם&nbsp;שאלות&nbsp;אנגלית&nbsp;עזה.&nbsp;שמות&nbsp;בקלות&nbsp;מה&nbsp;סדר.</span>'
		];
		let actual = renderViewLine(new RenderLineInput(
			false,
			lineText,
			true,
			0,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));
		assert.equal(actual.html, '<span>' + expectedOutput.join('') + '</span>');
		assert.equal(actual.containsRTL, true);
	});

	test('issue #19673: Monokai Theme bad-highlighting in line wrap', () => {
		let lineText = '    MongoCallback<string>): void {';

		let lineParts = [
			createPart(17, 1),
			createPart(18, 2),
			createPart(24, 3),
			createPart(26, 4),
			createPart(27, 5),
			createPart(28, 6),
			createPart(32, 7),
			createPart(34, 8),
		];
		let expectedOutput = [
			'<span class="">&nbsp;&nbsp;&nbsp;&nbsp;</span>',
			'<span class="mtk1">MongoCallback</span>',
			'<span class="mtk2">&lt;</span>',
			'<span class="mtk3">string</span>',
			'<span class="mtk4">&gt;)</span>',
			'<span class="mtk5">:</span>',
			'<span class="mtk6">&nbsp;</span>',
			'<span class="mtk7">void</span>',
			'<span class="mtk8">&nbsp;{</span>'
		].join('');

		let _actual = renderViewLine(new RenderLineInput(
			true,
			lineText,
			false,
			4,
			lineParts,
			[],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		assert.equal(_actual.html, '<span>' + expectedOutput + '</span>');
	});

	function assertCharacterMapping(actual: CharacterMapping, expected: number[][]): void {
		let charOffset = 0;
		for (let partIndex = 0; partIndex < expected.length; partIndex++) {
			let part = expected[partIndex];
			for (let i = 0; i < part.length; i++) {
				let charIndex = part[i];
				// here
				let _actualPartData = actual.charOffsetToPartData(charOffset);
				let actualPartIndex = CharacterMapping.getPartIndex(_actualPartData);
				let actualCharIndex = CharacterMapping.getCharIndex(_actualPartData);

				assert.deepEqual(
					{ partIndex: actualPartIndex, charIndex: actualCharIndex },
					{ partIndex: partIndex, charIndex: charIndex },
					`character mapping for offset ${charOffset}`
				);

				// here
				let actualOffset = actual.partDataToCharOffset(partIndex, part[part.length - 1] + 1, charIndex);

				assert.equal(
					actualOffset,
					charOffset,
					`character mapping for part ${partIndex}, ${charIndex}`
				);

				charOffset++;
			}
		}

		assert.equal(actual.length, charOffset);
	}

	function assertPartLengths(actual: CharacterMapping, expected: number[]): void {
		let _partLengths = actual.getPartLengths();
		let actualLengths: number[] = [];
		for (let i = 0; i < _partLengths.length; i++) {
			actualLengths[i] = _partLengths[i];
		}
		assert.deepEqual(actualLengths, expected, 'part lengths OK');
	}
});

suite('viewLineRenderer.renderLine 2', () => {
	function createPart(endIndex: number, foreground: number): ViewLineToken {
		return new ViewLineToken(endIndex, (
			foreground << MetadataConsts.FOREGROUND_OFFSET
		) >>> 0);
	}

	function testCreateLineParts(fontIsMonospace: boolean, lineContent: string, tokens: ViewLineToken[], fauxIndentLength: number, renderWhitespace: 'none' | 'boundary' | 'all', expected: string): void {
		let actual = renderViewLine(new RenderLineInput(
			fontIsMonospace,
			lineContent,
			false,
			fauxIndentLength,
			tokens,
			[],
			4,
			10,
			-1,
			renderWhitespace,
			false,
			false
		));

		assert.deepEqual(actual.html, expected);
	}

	test('issue #18616: Inline decorations ending at the text length are no longer rendered', () => {

		let lineContent = 'https://microsoft.com';

		let actual = renderViewLine(new RenderLineInput(
			false,
			lineContent,
			false,
			0,
			[createPart(21, 3)],
			[new LineDecoration(1, 22, 'link', false)],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		let expected = [
			'<span>',
			'<span class="mtk3 link">https://microsoft.com</span>',
			'</span>'
		].join('');

		assert.deepEqual(actual.html, expected);
	});

	test('issue #19207: Link in Monokai is not rendered correctly', () => {

		let lineContent = '\'let url = `http://***/_api/web/lists/GetByTitle(\\\'Teambuildingaanvragen\\\')/items`;\'';

		let actual = renderViewLine(new RenderLineInput(
			true,
			lineContent,
			false,
			0,
			[
				createPart(49, 6),
				createPart(51, 4),
				createPart(72, 6),
				createPart(74, 4),
				createPart(84, 6),
			],
			[
				new LineDecoration(13, 51, 'detected-link', false)
			],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		let expected = [
			'<span>',
			'<span class="mtk6">\'let&nbsp;url&nbsp;=&nbsp;`</span>',
			'<span class="mtk6 detected-link">http://***/_api/web/lists/GetByTitle(</span>',
			'<span class="mtk4 detected-link">\\</span>',
			'<span class="mtk4">\'</span>',
			'<span class="mtk6">Teambuildingaanvragen</span>',
			'<span class="mtk4">\\\'</span>',
			'<span class="mtk6">)/items`;\'</span>',
			'</span>'
		].join('');

		assert.deepEqual(actual.html, expected);
	});

	test('createLineParts simple', () => {
		testCreateLineParts(
			false,
			'Hello world!',
			[
				createPart(12, 1)
			],
			0,
			'none',
			[
				'<span>',
				'<span class="mtk1">Hello&nbsp;world!</span>',
				'</span>',
			].join('')
		);
	});
	test('createLineParts simple two tokens', () => {
		testCreateLineParts(
			false,
			'Hello world!',
			[
				createPart(6, 1),
				createPart(12, 2)
			],
			0,
			'none',
			[
				'<span>',
				'<span class="mtk1">Hello&nbsp;</span>',
				'<span class="mtk2">world!</span>',
				'</span>',
			].join('')
		);
	});
	test('createLineParts render whitespace - 4 leading spaces', () => {
		testCreateLineParts(
			false,
			'    Hello world!    ',
			[
				createPart(4, 1),
				createPart(6, 2),
				createPart(20, 3)
			],
			0,
			'boundary',
			[
				'<span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'</span>',
			].join('')
		);
	});
	test('createLineParts render whitespace - 8 leading spaces', () => {
		testCreateLineParts(
			false,
			'        Hello world!        ',
			[
				createPart(8, 1),
				createPart(10, 2),
				createPart(28, 3)
			],
			0,
			'boundary',
			[
				'<span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'</span>',
			].join('')
		);
	});
	test('createLineParts render whitespace - 2 leading tabs', () => {
		testCreateLineParts(
			false,
			'\t\tHello world!\t',
			[
				createPart(2, 1),
				createPart(4, 2),
				createPart(15, 3)
			],
			0,
			'boundary',
			[
				'<span>',
				'<span class="vs-whitespace" style="width:40px">&rarr;&nbsp;&nbsp;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:40px">&rarr;&nbsp;&nbsp;&nbsp;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace" style="width:40px">&rarr;&nbsp;&nbsp;&nbsp;</span>',
				'</span>',
			].join('')
		);
	});
	test('createLineParts render whitespace - mixed leading spaces and tabs', () => {
		testCreateLineParts(
			false,
			'  \t\t  Hello world! \t  \t   \t    ',
			[
				createPart(6, 1),
				createPart(8, 2),
				createPart(31, 3)
			],
			0,
			'boundary',
			[
				'<span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&rarr;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:40px">&rarr;&nbsp;&nbsp;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&middot;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&rarr;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&rarr;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&rarr;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'</span>',
			].join('')
		);
	});

	test('createLineParts render whitespace skips faux indent', () => {
		testCreateLineParts(
			false,
			'\t\t  Hello world! \t  \t   \t    ',
			[
				createPart(4, 1),
				createPart(6, 2),
				createPart(29, 3)
			],
			2,
			'boundary',
			[
				'<span>',
				'<span class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&middot;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&rarr;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&rarr;&nbsp;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&rarr;</span>',
				'<span class="vs-whitespace" style="width:40px">&middot;&middot;&middot;&middot;</span>',
				'</span>',
			].join('')
		);
	});

	test('createLineParts does not emit width for monospace fonts', () => {
		testCreateLineParts(
			true,
			'\t\t  Hello world! \t  \t   \t    ',
			[
				createPart(4, 1),
				createPart(6, 2),
				createPart(29, 3)
			],
			2,
			'boundary',
			[
				'<span>',
				'<span class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>',
				'<span class="vs-whitespace">&middot;&middot;</span>',
				'<span class="mtk2">He</span>',
				'<span class="mtk3">llo&nbsp;world!</span>',
				'<span class="vs-whitespace">&middot;&rarr;&middot;&middot;&rarr;&nbsp;&middot;&middot;&middot;&rarr;&middot;&middot;&middot;&middot;</span>',
				'</span>',
			].join('')
		);
	});

	test('createLineParts render whitespace in middle but not for one space', () => {
		testCreateLineParts(
			false,
			'it  it it  it',
			[
				createPart(6, 1),
				createPart(7, 2),
				createPart(13, 3)
			],
			0,
			'boundary',
			[
				'<span>',
				'<span class="mtk1">it</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&middot;</span>',
				'<span class="mtk1">it</span>',
				'<span class="mtk2">&nbsp;</span>',
				'<span class="mtk3">it</span>',
				'<span class="vs-whitespace" style="width:20px">&middot;&middot;</span>',
				'<span class="mtk3">it</span>',
				'</span>',
			].join('')
		);
	});

	test('createLineParts render whitespace for all in middle', () => {
		testCreateLineParts(
			false,
			' Hello world!\t',
			[
				createPart(4, 0),
				createPart(6, 1),
				createPart(14, 2)
			],
			0,
			'all',
			[
				'<span>',
				'<span class="vs-whitespace" style="width:10px">&middot;</span>',
				'<span class="mtk0">Hel</span>',
				'<span class="mtk1">lo</span>',
				'<span class="vs-whitespace" style="width:10px">&middot;</span>',
				'<span class="mtk2">world!</span>',
				'<span class="vs-whitespace" style="width:30px">&rarr;&nbsp;&nbsp;</span>',
				'</span>',
			].join('')
		);
	});

	test('createLineParts can handle unsorted inline decorations', () => {
		let actual = renderViewLine(new RenderLineInput(
			false,
			'Hello world',
			false,
			0,
			[createPart(11, 0)],
			[
				new LineDecoration(5, 7, 'a', false),
				new LineDecoration(1, 3, 'b', false),
				new LineDecoration(2, 8, 'c', false),
			],
			4,
			10,
			-1,
			'none',
			false,
			false
		));

		// 01234567890
		// Hello world
		// ----aa-----
		// bb---------
		// -cccccc----

		assert.deepEqual(actual.html, [
			'<span>',
			'<span class="mtk0 b">H</span>',
			'<span class="mtk0 b c">e</span>',
			'<span class="mtk0 c">ll</span>',
			'<span class="mtk0 a c">o&nbsp;</span>',
			'<span class="mtk0 c">w</span>',
			'<span class="mtk0">orld</span>',
			'</span>',
		].join(''));
	});

	function createTestGetColumnOfLinePartOffset(lineContent: string, tabSize: number, parts: ViewLineToken[], expectedPartLengths: number[]): (partIndex: number, partLength: number, offset: number, expected: number) => void {
		let renderLineOutput = renderViewLine(new RenderLineInput(
			false,
			lineContent,
			false,
			0,
			parts,
			[],
			tabSize,
			10,
			-1,
			'none',
			false,
			false
		));

		const partLengths = renderLineOutput.characterMapping.getPartLengths();
		let actualPartLengths: number[] = [];
		for (let i = 0; i < partLengths.length; i++) {
			actualPartLengths[i] = partLengths[i];
		}
		assert.deepEqual(actualPartLengths, expectedPartLengths, 'part lengths OK');

		return (partIndex: number, partLength: number, offset: number, expected: number) => {
			let charOffset = renderLineOutput.characterMapping.partDataToCharOffset(partIndex, partLength, offset);
			let actual = charOffset + 1;
			assert.equal(actual, expected, 'getColumnOfLinePartOffset for ' + partIndex + ' @ ' + offset);
		};
	}

	test('getColumnOfLinePartOffset 1 - simple text', () => {
		let testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset(
			'hello world',
			4,
			[
				createPart(11, 1)
			],
			[11]
		);
		testGetColumnOfLinePartOffset(0, 11, 0, 1);
		testGetColumnOfLinePartOffset(0, 11, 1, 2);
		testGetColumnOfLinePartOffset(0, 11, 2, 3);
		testGetColumnOfLinePartOffset(0, 11, 3, 4);
		testGetColumnOfLinePartOffset(0, 11, 4, 5);
		testGetColumnOfLinePartOffset(0, 11, 5, 6);
		testGetColumnOfLinePartOffset(0, 11, 6, 7);
		testGetColumnOfLinePartOffset(0, 11, 7, 8);
		testGetColumnOfLinePartOffset(0, 11, 8, 9);
		testGetColumnOfLinePartOffset(0, 11, 9, 10);
		testGetColumnOfLinePartOffset(0, 11, 10, 11);
		testGetColumnOfLinePartOffset(0, 11, 11, 12);
	});

	test('getColumnOfLinePartOffset 2 - regular JS', () => {
		let testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset(
			'var x = 3;',
			4,
			[
				createPart(3, 1),
				createPart(4, 2),
				createPart(5, 3),
				createPart(8, 4),
				createPart(9, 5),
				createPart(10, 6),
			],
			[3, 1, 1, 3, 1, 1]
		);
		testGetColumnOfLinePartOffset(0, 3, 0, 1);
		testGetColumnOfLinePartOffset(0, 3, 1, 2);
		testGetColumnOfLinePartOffset(0, 3, 2, 3);
		testGetColumnOfLinePartOffset(0, 3, 3, 4);
		testGetColumnOfLinePartOffset(1, 1, 0, 4);
		testGetColumnOfLinePartOffset(1, 1, 1, 5);
		testGetColumnOfLinePartOffset(2, 1, 0, 5);
		testGetColumnOfLinePartOffset(2, 1, 1, 6);
		testGetColumnOfLinePartOffset(3, 3, 0, 6);
		testGetColumnOfLinePartOffset(3, 3, 1, 7);
		testGetColumnOfLinePartOffset(3, 3, 2, 8);
		testGetColumnOfLinePartOffset(3, 3, 3, 9);
		testGetColumnOfLinePartOffset(4, 1, 0, 9);
		testGetColumnOfLinePartOffset(4, 1, 1, 10);
		testGetColumnOfLinePartOffset(5, 1, 0, 10);
		testGetColumnOfLinePartOffset(5, 1, 1, 11);
	});

	test('getColumnOfLinePartOffset 3 - tab with tab size 6', () => {
		let testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset(
			'\t',
			6,
			[
				createPart(1, 1)
			],
			[6]
		);
		testGetColumnOfLinePartOffset(0, 6, 0, 1);
		testGetColumnOfLinePartOffset(0, 6, 1, 1);
		testGetColumnOfLinePartOffset(0, 6, 2, 1);
		testGetColumnOfLinePartOffset(0, 6, 3, 1);
		testGetColumnOfLinePartOffset(0, 6, 4, 2);
		testGetColumnOfLinePartOffset(0, 6, 5, 2);
		testGetColumnOfLinePartOffset(0, 6, 6, 2);
	});

	test('getColumnOfLinePartOffset 4 - once indented line, tab size 4', () => {
		let testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset(
			'\tfunction',
			4,
			[
				createPart(1, 1),
				createPart(9, 2),
			],
			[4, 8]
		);
		testGetColumnOfLinePartOffset(0, 4, 0, 1);
		testGetColumnOfLinePartOffset(0, 4, 1, 1);
		testGetColumnOfLinePartOffset(0, 4, 2, 1);
		testGetColumnOfLinePartOffset(0, 4, 3, 2);
		testGetColumnOfLinePartOffset(0, 4, 4, 2);
		testGetColumnOfLinePartOffset(1, 8, 0, 2);
		testGetColumnOfLinePartOffset(1, 8, 1, 3);
		testGetColumnOfLinePartOffset(1, 8, 2, 4);
		testGetColumnOfLinePartOffset(1, 8, 3, 5);
		testGetColumnOfLinePartOffset(1, 8, 4, 6);
		testGetColumnOfLinePartOffset(1, 8, 5, 7);
		testGetColumnOfLinePartOffset(1, 8, 6, 8);
		testGetColumnOfLinePartOffset(1, 8, 7, 9);
		testGetColumnOfLinePartOffset(1, 8, 8, 10);
	});

	test('getColumnOfLinePartOffset 5 - twice indented line, tab size 4', () => {
		let testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset(
			'\t\tfunction',
			4,
			[
				createPart(2, 1),
				createPart(10, 2),
			],
			[8, 8]
		);
		testGetColumnOfLinePartOffset(0, 8, 0, 1);
		testGetColumnOfLinePartOffset(0, 8, 1, 1);
		testGetColumnOfLinePartOffset(0, 8, 2, 1);
		testGetColumnOfLinePartOffset(0, 8, 3, 2);
		testGetColumnOfLinePartOffset(0, 8, 4, 2);
		testGetColumnOfLinePartOffset(0, 8, 5, 2);
		testGetColumnOfLinePartOffset(0, 8, 6, 2);
		testGetColumnOfLinePartOffset(0, 8, 7, 3);
		testGetColumnOfLinePartOffset(0, 8, 8, 3);
		testGetColumnOfLinePartOffset(1, 8, 0, 3);
		testGetColumnOfLinePartOffset(1, 8, 1, 4);
		testGetColumnOfLinePartOffset(1, 8, 2, 5);
		testGetColumnOfLinePartOffset(1, 8, 3, 6);
		testGetColumnOfLinePartOffset(1, 8, 4, 7);
		testGetColumnOfLinePartOffset(1, 8, 5, 8);
		testGetColumnOfLinePartOffset(1, 8, 6, 9);
		testGetColumnOfLinePartOffset(1, 8, 7, 10);
		testGetColumnOfLinePartOffset(1, 8, 8, 11);
	});
});
