/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./goToDeclaration';
import * as nls from 'vs/nls';
import { Throttler } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { MarkedString } from 'vs/base/common/htmlContent';
import { KeyCode, KeyMod, KeyChord } from 'vs/base/common/keyCodes';
import * as platform from 'vs/base/common/platform';
import Severity from 'vs/base/common/severity';
import { TPromise } from 'vs/base/common/winjs.base';
import * as browser from 'vs/base/browser/browser';
import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IEditorService } from 'vs/platform/editor/common/editor';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IMessageService } from 'vs/platform/message/common/message';
import { Range } from 'vs/editor/common/core/range';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { editorAction, IActionOptions, ServicesAccessor, EditorAction } from 'vs/editor/common/editorCommonExtensions';
import { Location, DefinitionProviderRegistry } from 'vs/editor/common/modes';
import { ICodeEditor, IEditorMouseEvent, IMouseTarget, MouseTargetType } from 'vs/editor/browser/editorBrowser';
import { editorContribution } from 'vs/editor/browser/editorBrowserExtensions';
import { getDefinitionsAtPosition, getImplementationsAtPosition, getTypeDefinitionsAtPosition } from 'vs/editor/contrib/goToDeclaration/common/goToDeclaration';
import { ReferencesController } from 'vs/editor/contrib/referenceSearch/browser/referencesController';
import { ReferencesModel } from 'vs/editor/contrib/referenceSearch/browser/referencesModel';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { PeekContext } from 'vs/editor/contrib/zoneWidget/browser/peekViewWidget';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ITextModelResolverService } from 'vs/editor/common/services/resolverService';
import { MessageController } from './messageController';
import * as corePosition from 'vs/editor/common/core/position';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { ICursorSelectionChangedEvent } from 'vs/editor/common/controller/cursorEvents';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { editorActiveLinkForeground } from 'vs/platform/theme/common/colorRegistry';
import { EditorState, CodeEditorStateFlag } from 'vs/editor/common/core/editorState';


export class DefinitionActionConfig {

	constructor(
		public openToSide = false,
		public openInPeek = false,
		public filterCurrent = true
	) {
		//
	}
}

export class DefinitionAction extends EditorAction {

	private _configuration: DefinitionActionConfig;

	constructor(configuration: DefinitionActionConfig, opts: IActionOptions) {
		super(opts);
		this._configuration = configuration;
	}

	public run(accessor: ServicesAccessor, editor: editorCommon.ICommonCodeEditor): TPromise<void> {
		const messageService = accessor.get(IMessageService);
		const editorService = accessor.get(IEditorService);

		const model = editor.getModel();
		const pos = editor.getPosition();

		return this._getDeclarationsAtPosition(model, pos).then(references => {

			if (model.isDisposed() || editor.getModel() !== model) {
				// new model, no more model
				return;
			}

			// * remove falsy references
			// * find reference at the current pos
			let idxOfCurrent = -1;
			let result: Location[] = [];
			for (let i = 0; i < references.length; i++) {
				let reference = references[i];
				if (!reference || !reference.range) {
					continue;
				}
				let { uri, range } = reference;
				let newLen = result.push({
					uri,
					range
				});
				if (this._configuration.filterCurrent
					&& uri.toString() === model.uri.toString()
					&& Range.containsPosition(range, pos)
					&& idxOfCurrent === -1
				) {
					idxOfCurrent = newLen - 1;
				}
			}

			if (result.length === 0) {
				// no result -> show message
				const info = model.getWordAtPosition(pos);
				MessageController.get(editor).showMessage(this._getNoResultFoundMessage(info), pos);

			} else if (result.length === 1 && idxOfCurrent !== -1) {
				// only the position at which we are -> adjust selection
				let [current] = result;
				this._openReference(editorService, current, false);

			} else {
				// handle multile results
				this._onResult(editorService, editor, new ReferencesModel(result));
			}

		}, (err) => {
			// report an error
			messageService.show(Severity.Error, err);
			return false;
		});
	}

	protected _getDeclarationsAtPosition(model: editorCommon.IModel, position: corePosition.Position): TPromise<Location[]> {
		return getDefinitionsAtPosition(model, position);
	}

	protected _getNoResultFoundMessage(info?: editorCommon.IWordAtPosition): string {
		return info && info.word
			? nls.localize('noResultWord', "No definition found for '{0}'", info.word)
			: nls.localize('generic.noResults', "No definition found");
	}

	protected _getMetaTitle(model: ReferencesModel): string {
		return model.references.length > 1 && nls.localize('meta.title', " – {0} definitions", model.references.length);
	}

	private _onResult(editorService: IEditorService, editor: editorCommon.ICommonCodeEditor, model: ReferencesModel) {

		const msg = model.getAriaMessage();
		alert(msg);

		if (this._configuration.openInPeek) {
			this._openInPeek(editorService, editor, model);
		} else {
			let next = model.nearestReference(editor.getModel().uri, editor.getPosition());
			this._openReference(editorService, next, this._configuration.openToSide).then(editor => {
				if (editor && model.references.length > 1) {
					this._openInPeek(editorService, editor, model);
				} else {
					model.dispose();
				}
			});
		}
	}

	private _openReference(editorService: IEditorService, reference: Location, sideBySide: boolean): TPromise<editorCommon.ICommonCodeEditor> {
		let { uri, range } = reference;
		return editorService.openEditor({
			resource: uri,
			options: {
				selection: Range.collapseToStart(range),
				revealIfVisible: !sideBySide
			}
		}, sideBySide).then(editor => {
			return editor && <editorCommon.IEditor>editor.getControl();
		});
	}

	private _openInPeek(editorService: IEditorService, target: editorCommon.ICommonCodeEditor, model: ReferencesModel) {
		let controller = ReferencesController.get(target);
		if (controller) {
			controller.toggleWidget(target.getSelection(), TPromise.as(model), {
				getMetaTitle: (model) => {
					return this._getMetaTitle(model);
				},
				onGoto: (reference) => {
					controller.closeWidget();
					return this._openReference(editorService, reference, false);
				}
			});
		} else {
			model.dispose();
		}
	}
}

const goToDeclarationKb = platform.isWeb
	? KeyMod.CtrlCmd | KeyCode.F12
	: KeyCode.F12;

@editorAction
export class GoToDefinitionAction extends DefinitionAction {

	public static ID = 'editor.action.goToDeclaration';

	constructor() {
		super(new DefinitionActionConfig(), {
			id: GoToDefinitionAction.ID,
			label: nls.localize('actions.goToDecl.label', "Go to Definition"),
			alias: 'Go to Definition',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasDefinitionProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: goToDeclarationKb
			},
			menuOpts: {
				group: 'navigation',
				order: 1.1
			}
		});
	}
}

@editorAction
export class OpenDefinitionToSideAction extends DefinitionAction {

	public static ID = 'editor.action.openDeclarationToTheSide';

	constructor() {
		super(new DefinitionActionConfig(true), {
			id: OpenDefinitionToSideAction.ID,
			label: nls.localize('actions.goToDeclToSide.label', "Open Definition to the Side"),
			alias: 'Open Definition to the Side',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasDefinitionProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KEY_K, goToDeclarationKb)
			}
		});
	}
}

@editorAction
export class PeekDefinitionAction extends DefinitionAction {
	constructor() {
		super(new DefinitionActionConfig(void 0, true, false), {
			id: 'editor.action.previewDeclaration',
			label: nls.localize('actions.previewDecl.label', "Peek Definition"),
			alias: 'Peek Definition',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasDefinitionProvider,
				PeekContext.notInPeekEditor,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: KeyMod.Alt | KeyCode.F12,
				linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F10 }
			},
			menuOpts: {
				group: 'navigation',
				order: 1.2
			}
		});
	}
}

export class ImplementationAction extends DefinitionAction {
	protected _getDeclarationsAtPosition(model: editorCommon.IModel, position: corePosition.Position): TPromise<Location[]> {
		return getImplementationsAtPosition(model, position);
	}

	protected _getNoResultFoundMessage(info?: editorCommon.IWordAtPosition): string {
		return info && info.word
			? nls.localize('goToImplementation.noResultWord', "No implementation found for '{0}'", info.word)
			: nls.localize('goToImplementation.generic.noResults', "No implementation found");
	}

	protected _getMetaTitle(model: ReferencesModel): string {
		return model.references.length > 1 && nls.localize('meta.implementations.title', " – {0} implementations", model.references.length);
	}
}

@editorAction
export class GoToImplementationAction extends ImplementationAction {

	public static ID = 'editor.action.goToImplementation';

	constructor() {
		super(new DefinitionActionConfig(), {
			id: GoToImplementationAction.ID,
			label: nls.localize('actions.goToImplementation.label', "Go to Implementation"),
			alias: 'Go to Implementation',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasImplementationProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: KeyMod.CtrlCmd | KeyCode.F12
			}
		});
	}
}

@editorAction
export class PeekImplementationAction extends ImplementationAction {

	public static ID = 'editor.action.peekImplementation';

	constructor() {
		super(new DefinitionActionConfig(false, true, false), {
			id: PeekImplementationAction.ID,
			label: nls.localize('actions.peekImplementation.label', "Peek Implementation"),
			alias: 'Peek Implementation',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasImplementationProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F12
			}
		});
	}
}

export class TypeDefinitionAction extends DefinitionAction {
	protected _getDeclarationsAtPosition(model: editorCommon.IModel, position: corePosition.Position): TPromise<Location[]> {
		return getTypeDefinitionsAtPosition(model, position);
	}

	protected _getNoResultFoundMessage(info?: editorCommon.IWordAtPosition): string {
		return info && info.word
			? nls.localize('goToTypeDefinition.noResultWord', "No type definition found for '{0}'", info.word)
			: nls.localize('goToTypeDefinition.generic.noResults', "No type definition found");
	}

	protected _getMetaTitle(model: ReferencesModel): string {
		return model.references.length > 1 && nls.localize('meta.typeDefinitions.title', " – {0} type definitions", model.references.length);
	}
}

@editorAction
export class GoToTypeDefintionAction extends TypeDefinitionAction {

	public static ID = 'editor.action.goToTypeDefinition';

	constructor() {
		super(new DefinitionActionConfig(), {
			id: GoToTypeDefintionAction.ID,
			label: nls.localize('actions.goToTypeDefinition.label', "Go to Type Definition"),
			alias: 'Go to Type Definition',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasTypeDefinitionProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: 0
			},
			menuOpts: {
				group: 'navigation',
				order: 1.4
			}
		});
	}
}

@editorAction
export class PeekTypeDefinitionAction extends TypeDefinitionAction {

	public static ID = 'editor.action.peekTypeDefinition';

	constructor() {
		super(new DefinitionActionConfig(false, true, false), {
			id: PeekTypeDefinitionAction.ID,
			label: nls.localize('actions.peekTypeDefinition.label', "Peek Type Definition"),
			alias: 'Peek Type Definition',
			precondition: ContextKeyExpr.and(
				EditorContextKeys.hasTypeDefinitionProvider,
				EditorContextKeys.isInEmbeddedEditor.toNegated()),
			kbOpts: {
				kbExpr: EditorContextKeys.textFocus,
				primary: 0
			}
		});
	}
}


// --- Editor Contribution to goto definition using the mouse and a modifier key

@editorContribution
class GotoDefinitionWithMouseEditorContribution implements editorCommon.IEditorContribution {

	private static ID = 'editor.contrib.gotodefinitionwithmouse';
	static TRIGGER_MODIFIER = platform.isMacintosh ? 'metaKey' : 'ctrlKey';
	static TRIGGER_SIDEBYSIDE_KEY_VALUE = KeyCode.Alt;
	static TRIGGER_KEY_VALUE = platform.isMacintosh ? KeyCode.Meta : KeyCode.Ctrl;
	static MAX_SOURCE_PREVIEW_LINES = 8;

	private editor: ICodeEditor;
	private toUnhook: IDisposable[];
	private decorations: string[];
	private currentWordUnderMouse: editorCommon.IWordAtPosition;
	private throttler: Throttler;
	private lastMouseMoveEvent: IEditorMouseEvent;
	private hasTriggerKeyOnMouseDown: boolean;

	constructor(
		editor: ICodeEditor,
		@ITextModelResolverService private textModelResolverService: ITextModelResolverService,
		@IModeService private modeService: IModeService
	) {
		this.toUnhook = [];
		this.decorations = [];
		this.editor = editor;
		this.throttler = new Throttler();

		this.toUnhook.push(this.editor.onMouseDown((e: IEditorMouseEvent) => this.onEditorMouseDown(e)));
		this.toUnhook.push(this.editor.onMouseUp((e: IEditorMouseEvent) => this.onEditorMouseUp(e)));
		this.toUnhook.push(this.editor.onMouseMove((e: IEditorMouseEvent) => this.onEditorMouseMove(e)));
		this.toUnhook.push(this.editor.onMouseDrag(() => this.resetHandler()));
		this.toUnhook.push(this.editor.onKeyDown((e: IKeyboardEvent) => this.onEditorKeyDown(e)));
		this.toUnhook.push(this.editor.onKeyUp((e: IKeyboardEvent) => this.onEditorKeyUp(e)));

		this.toUnhook.push(this.editor.onDidChangeCursorSelection((e) => this.onDidChangeCursorSelection(e)));
		this.toUnhook.push(this.editor.onDidChangeModel((e) => this.resetHandler()));
		this.toUnhook.push(this.editor.onDidChangeModelContent(() => this.resetHandler()));
		this.toUnhook.push(this.editor.onDidScrollChange((e) => {
			if (e.scrollTopChanged || e.scrollLeftChanged) {
				this.resetHandler();
			}
		}));
	}

	private onDidChangeCursorSelection(e: ICursorSelectionChangedEvent): void {
		if (e.selection && e.selection.startColumn !== e.selection.endColumn) {
			this.resetHandler(); // immediately stop this feature if the user starts to select (https://github.com/Microsoft/vscode/issues/7827)
		}
	}

	private onEditorMouseMove(mouseEvent: IEditorMouseEvent, withKey?: IKeyboardEvent): void {
		this.lastMouseMoveEvent = mouseEvent;

		this.startFindDefinition(mouseEvent, withKey);
	}

	private startFindDefinition(mouseEvent: IEditorMouseEvent, withKey?: IKeyboardEvent): void {
		if (!this.isEnabled(mouseEvent, withKey)) {
			this.currentWordUnderMouse = null;
			this.removeDecorations();
			return;
		}

		// Find word at mouse position
		let position = mouseEvent.target.position;
		let word = position ? this.editor.getModel().getWordAtPosition(position) : null;
		if (!word) {
			this.currentWordUnderMouse = null;
			this.removeDecorations();
			return;
		}

		// Return early if word at position is still the same
		if (this.currentWordUnderMouse && this.currentWordUnderMouse.startColumn === word.startColumn && this.currentWordUnderMouse.endColumn === word.endColumn && this.currentWordUnderMouse.word === word.word) {
			return;
		}

		this.currentWordUnderMouse = word;

		// Find definition and decorate word if found
		let state = new EditorState(this.editor, CodeEditorStateFlag.Position | CodeEditorStateFlag.Value | CodeEditorStateFlag.Selection | CodeEditorStateFlag.Scroll);

		this.throttler.queue(() => {
			return state.validate(this.editor)
				? this.findDefinition(mouseEvent.target)
				: TPromise.as<Location[]>(null);

		}).then(results => {
			if (!results || !results.length || !state.validate(this.editor)) {
				this.removeDecorations();
				return;
			}

			// Multiple results
			if (results.length > 1) {
				this.addDecoration(new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn), nls.localize('multipleResults', "Click to show {0} definitions.", results.length));
			}

			// Single result
			else {
				let result = results[0];

				if (!result.uri) {
					return;
				}

				this.textModelResolverService.createModelReference(result.uri).then(ref => {

					if (!ref.object || !ref.object.textEditorModel) {
						ref.dispose();
						return;
					}

					const { object: { textEditorModel } } = ref;
					const { startLineNumber } = result.range;

					if (textEditorModel.getLineMaxColumn(startLineNumber) === 0) {
						ref.dispose();
						return;
					}

					const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
					const maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + GotoDefinitionWithMouseEditorContribution.MAX_SOURCE_PREVIEW_LINES);
					let endLineNumber = startLineNumber + 1;
					let minIndent = startIndent;

					for (; endLineNumber < maxLineNumber; endLineNumber++) {
						let endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
						minIndent = Math.min(minIndent, endIndent);
						if (startIndent === endIndent) {
							break;
						}
					}

					const previewRange = new Range(startLineNumber, 1, endLineNumber + 1, 1);
					const value = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, 'gm'), '').trim();

					this.addDecoration(new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn), {
						language: this.modeService.getModeIdByFilenameOrFirstLine(textEditorModel.uri.fsPath),
						value
					});
					ref.dispose();
				});
			}
		}).done(undefined, onUnexpectedError);
	}

	private addDecoration(range: Range, hoverMessage: MarkedString): void {

		const newDecorations: editorCommon.IModelDeltaDecoration = {
			range: range,
			options: {
				inlineClassName: 'goto-definition-link',
				hoverMessage
			}
		};

		this.decorations = this.editor.deltaDecorations(this.decorations, [newDecorations]);
	}

	private removeDecorations(): void {
		if (this.decorations.length > 0) {
			this.decorations = this.editor.deltaDecorations(this.decorations, []);
		}
	}

	private onEditorKeyDown(e: IKeyboardEvent): void {
		if (
			this.lastMouseMoveEvent && (
				e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE || // User just pressed Ctrl/Cmd (normal goto definition)
				e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_SIDEBYSIDE_KEY_VALUE && e[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER] // User pressed Ctrl/Cmd+Alt (goto definition to the side)
			)
		) {
			this.startFindDefinition(this.lastMouseMoveEvent, e);
		} else if (e[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER]) {
			this.removeDecorations(); // remove decorations if user holds another key with ctrl/cmd to prevent accident goto declaration
		}
	}

	private resetHandler(): void {
		this.lastMouseMoveEvent = null;
		this.hasTriggerKeyOnMouseDown = false;
		this.removeDecorations();
	}

	private onEditorMouseDown(mouseEvent: IEditorMouseEvent): void {
		// We need to record if we had the trigger key on mouse down because someone might select something in the editor
		// holding the mouse down and then while mouse is down start to press Ctrl/Cmd to start a copy operation and then
		// release the mouse button without wanting to do the navigation.
		// With this flag we prevent goto definition if the mouse was down before the trigger key was pressed.
		this.hasTriggerKeyOnMouseDown = !!mouseEvent.event[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER];
	}

	private onEditorMouseUp(mouseEvent: IEditorMouseEvent): void {
		if (this.isEnabled(mouseEvent) && this.hasTriggerKeyOnMouseDown) {
			this.gotoDefinition(mouseEvent.target, mouseEvent.event.altKey).done(() => {
				this.removeDecorations();
			}, (error: Error) => {
				this.removeDecorations();
				onUnexpectedError(error);
			});
		}
	}

	private onEditorKeyUp(e: IKeyboardEvent): void {
		if (e.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE) {
			this.removeDecorations();
			this.currentWordUnderMouse = null;
		}
	}

	private isEnabled(mouseEvent: IEditorMouseEvent, withKey?: IKeyboardEvent): boolean {
		return this.editor.getModel() &&
			(browser.isIE || mouseEvent.event.detail <= 1) && // IE does not support event.detail properly
			mouseEvent.target.type === MouseTargetType.CONTENT_TEXT &&
			(mouseEvent.event[GotoDefinitionWithMouseEditorContribution.TRIGGER_MODIFIER] || (withKey && withKey.keyCode === GotoDefinitionWithMouseEditorContribution.TRIGGER_KEY_VALUE)) &&
			DefinitionProviderRegistry.has(this.editor.getModel());
	}

	private findDefinition(target: IMouseTarget): TPromise<Location[]> {
		let model = this.editor.getModel();
		if (!model) {
			return TPromise.as(null);
		}

		return getDefinitionsAtPosition(this.editor.getModel(), target.position);
	}

	private gotoDefinition(target: IMouseTarget, sideBySide: boolean): TPromise<any> {

		const targetAction = sideBySide
			? OpenDefinitionToSideAction.ID
			: GoToDefinitionAction.ID;

		// just run the corresponding action
		this.editor.setPosition(target.position);
		return this.editor.getAction(targetAction).run();
	}

	public getId(): string {
		return GotoDefinitionWithMouseEditorContribution.ID;
	}

	public dispose(): void {
		this.toUnhook = dispose(this.toUnhook);
	}
}

registerThemingParticipant((theme, collector) => {
	let activeLinkForeground = theme.getColor(editorActiveLinkForeground);
	if (activeLinkForeground) {
		collector.addRule(`.monaco-editor .goto-definition-link { color: ${activeLinkForeground} !important; }`);
	}
});
