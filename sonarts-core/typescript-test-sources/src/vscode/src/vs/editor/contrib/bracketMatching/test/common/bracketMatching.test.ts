/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { withMockCodeEditor } from 'vs/editor/test/common/mocks/mockCodeEditor';
import { Position } from 'vs/editor/common/core/position';
import { Model } from 'vs/editor/common/model/model';
import { LanguageConfigurationRegistry } from 'vs/editor/common/modes/languageConfigurationRegistry';
import { MockMode } from 'vs/editor/test/common/mocks/mockMode';
import { LanguageIdentifier } from 'vs/editor/common/modes';
import { BracketMatchingController } from 'vs/editor/contrib/bracketMatching/common/bracketMatching';

suite('bracket matching', () => {
	test('issue #183: jump to matching bracket position', () => {
		class BracketMode extends MockMode {

			private static _id = new LanguageIdentifier('bracketMode', 3);

			constructor() {
				super(BracketMode._id);
				this._register(LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
					brackets: [
						['{', '}'],
						['[', ']'],
						['(', ')'],
					]
				}));
			}
		}

		let mode = new BracketMode();
		let model = Model.createFromString('var x = (3 + (5-7)) + ((5+3)+5);', undefined, mode.getLanguageIdentifier());

		withMockCodeEditor(null, { model: model }, (editor, cursor) => {
			let bracketMatchingController = editor.registerAndInstantiateContribution<BracketMatchingController>(BracketMatchingController);

			editor.setPosition(new Position(1, 20));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 9));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 19));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 9));

			editor.setPosition(new Position(1, 23));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 31));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 23));
			bracketMatchingController.jumpToBracket();
			assert.deepEqual(editor.getPosition(), new Position(1, 31));

			bracketMatchingController.dispose();
		});

		model.dispose();
		mode.dispose();
	});
});
