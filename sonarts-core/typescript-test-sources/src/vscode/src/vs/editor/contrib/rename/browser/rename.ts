/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as nls from 'vs/nls';
import { isPromiseCanceledError, onUnexpectedExternalError, illegalArgument } from 'vs/base/common/errors';
import { KeyMod, KeyCode } from 'vs/base/common/keyCodes';
import Severity from 'vs/base/common/severity';
import { TPromise } from 'vs/base/common/winjs.base';
import { IFileService } from 'vs/platform/files/common/files';
import { RawContextKey, IContextKey, IContextKeyService, ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IMessageService } from 'vs/platform/message/common/message';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { editorAction, ServicesAccessor, EditorAction, EditorCommand, CommonEditorRegistry } from 'vs/editor/common/editorCommonExtensions';
import { editorContribution } from 'vs/editor/browser/editorBrowserExtensions';
import { ICommonCodeEditor, IEditorContribution, IReadOnlyModel } from 'vs/editor/common/editorCommon';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { BulkEdit, createBulkEdit } from 'vs/editor/common/services/bulkEdit';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import RenameInputField from './renameInputField';
import { ITextModelResolverService } from 'vs/editor/common/services/resolverService';
import { optional } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { sequence, asWinJsPromise } from 'vs/base/common/async';
import { WorkspaceEdit, RenameProviderRegistry } from 'vs/editor/common/modes';
import { Position } from 'vs/editor/common/core/position';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { Range } from 'vs/editor/common/core/range';


export function rename(model: IReadOnlyModel, position: Position, newName: string): TPromise<WorkspaceEdit> {

	const supports = RenameProviderRegistry.ordered(model);
	const rejects: string[] = [];
	let hasResult = false;

	const factory = supports.map(support => {
		return () => {
			if (!hasResult) {
				return asWinJsPromise((token) => {
					return support.provideRenameEdits(model, position, newName, token);
				}).then(result => {
					if (!result) {
						// ignore
					} else if (!result.rejectReason) {
						hasResult = true;
						return result;
					} else {
						rejects.push(result.rejectReason);
					}
					return undefined;
				}, err => {
					onUnexpectedExternalError(err);
					return TPromise.wrapError<WorkspaceEdit>('provider failed');
				});
			}
			return undefined;
		};
	});

	return sequence(factory).then((values): WorkspaceEdit => {
		let result = values[0];
		if (rejects.length > 0) {
			return {
				edits: undefined,
				rejectReason: rejects.join('\n')
			};
		} else if (!result) {
			return {
				edits: undefined,
				rejectReason: nls.localize('no result', "No result.")
			};
		} else {
			return result;
		}
	});
}


// ---  register actions and commands

const CONTEXT_RENAME_INPUT_VISIBLE = new RawContextKey<boolean>('renameInputVisible', false);

@editorContribution
class RenameController implements IEditorContribution {

	private static ID = 'editor.contrib.renameController';

	public static get(editor: ICommonCodeEditor): RenameController {
		return editor.getContribution<RenameController>(RenameController.ID);
	}

	private _renameInputField: RenameInputField;
	private _renameInputVisible: IContextKey<boolean>;

	constructor(
		private editor: ICodeEditor,
		@IMessageService private _messageService: IMessageService,
		@ITextModelResolverService private _textModelResolverService: ITextModelResolverService,
		@IProgressService private _progressService: IProgressService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IThemeService themeService: IThemeService,
		@optional(IFileService) private _fileService: IFileService
	) {
		this._renameInputField = new RenameInputField(editor, themeService);
		this._renameInputVisible = CONTEXT_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
	}

	public dispose(): void {
		this._renameInputField.dispose();
	}

	public getId(): string {
		return RenameController.ID;
	}

	public run(): TPromise<void> {

		const selection = this.editor.getSelection(),
			word = this.editor.getModel().getWordAtPosition(selection.getStartPosition());

		if (!word) {
			return undefined;
		}

		let lineNumber = selection.startLineNumber,
			selectionStart = 0,
			selectionEnd = word.word.length,
			wordRange: Range;

		wordRange = new Range(
			lineNumber,
			word.startColumn,
			lineNumber,
			word.endColumn
		);

		if (!selection.isEmpty() && selection.startLineNumber === selection.endLineNumber) {
			selectionStart = Math.max(0, selection.startColumn - word.startColumn);
			selectionEnd = Math.min(word.endColumn, selection.endColumn) - word.startColumn;
		}

		this._renameInputVisible.set(true);
		return this._renameInputField.getInput(wordRange, word.word, selectionStart, selectionEnd).then(newName => {
			this._renameInputVisible.reset();
			this.editor.focus();

			const renameOperation = this._prepareRename(newName).then(edit => {

				return edit.finish().then(selection => {
					if (selection) {
						this.editor.setSelection(selection);
					}
					// alert
					alert(nls.localize('aria', "Successfully renamed '{0}' to '{1}'. Summary: {2}", word.word, newName, edit.ariaMessage()));
				});

			}, err => {
				if (typeof err === 'string') {
					this._messageService.show(Severity.Info, err);
					return undefined;
				} else {
					this._messageService.show(Severity.Error, nls.localize('rename.failed', "Sorry, rename failed to execute."));
					return TPromise.wrapError(err);
				}
			});

			this._progressService.showWhile(renameOperation, 250);
			return renameOperation;

		}, err => {
			this._renameInputVisible.reset();
			this.editor.focus();

			if (!isPromiseCanceledError(err)) {
				return TPromise.wrapError(err);
			}
			return undefined;
		});
	}

	public acceptRenameInput(): void {
		this._renameInputField.acceptInput();
	}

	public cancelRenameInput(): void {
		this._renameInputField.cancelInput();
	}

	private _prepareRename(newName: string): TPromise<BulkEdit> {

		// start recording of file changes so that we can figure out if a file that
		// is to be renamed conflicts with another (concurrent) modification
		let edit = createBulkEdit(this._textModelResolverService, <ICodeEditor>this.editor, this._fileService);

		return rename(this.editor.getModel(), this.editor.getPosition(), newName).then(result => {
			if (result.rejectReason) {
				return TPromise.wrapError<BulkEdit>(result.rejectReason);
			}
			edit.add(result.edits);
			return edit;
		});
	}
}

// ---- action implementation

@editorAction
export class RenameAction extends EditorAction {

	constructor() {
		super({
			id: 'editor.action.rename',
			label: nls.localize('rename.label', "Rename Symbol"),
			alias: 'Rename Symbol',
			precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasRenameProvider),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: KeyCode.F2
			},
			menuOpts: {
				group: '1_modification',
				order: 1.1
			}
		});
	}

	public run(accessor: ServicesAccessor, editor: ICommonCodeEditor): TPromise<void> {
		let controller = RenameController.get(editor);
		if (controller) {
			return controller.run();
		}
		return undefined;
	}
}

const RenameCommand = EditorCommand.bindToContribution<RenameController>(RenameController.get);

CommonEditorRegistry.registerEditorCommand(new RenameCommand({
	id: 'acceptRenameInput',
	precondition: CONTEXT_RENAME_INPUT_VISIBLE,
	handler: x => x.acceptRenameInput(),
	kbOpts: {
		weight: CommonEditorRegistry.commandWeight(99),
		kbExpr: EditorContextKeys.focus,
		primary: KeyCode.Enter
	}
}));

CommonEditorRegistry.registerEditorCommand(new RenameCommand({
	id: 'cancelRenameInput',
	precondition: CONTEXT_RENAME_INPUT_VISIBLE,
	handler: x => x.cancelRenameInput(),
	kbOpts: {
		weight: CommonEditorRegistry.commandWeight(99),
		kbExpr: EditorContextKeys.focus,
		primary: KeyCode.Escape,
		secondary: [KeyMod.Shift | KeyCode.Escape]
	}
}));

// ---- api bridge command

CommonEditorRegistry.registerDefaultLanguageCommand('_executeDocumentRenameProvider', function (model, position, args) {
	let { newName } = args;
	if (typeof newName !== 'string') {
		throw illegalArgument('newName');
	}
	return rename(model, position, newName);
});
