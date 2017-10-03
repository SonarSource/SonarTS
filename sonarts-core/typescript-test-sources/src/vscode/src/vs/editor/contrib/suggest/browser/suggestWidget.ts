/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/suggest';
import * as nls from 'vs/nls';
import { createMatches } from 'vs/base/common/filters';
import * as strings from 'vs/base/common/strings';
import Event, { Emitter, chain } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { isPromiseCanceledError, onUnexpectedError } from 'vs/base/common/errors';
import { IDisposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { addClass, append, $, hide, removeClass, show, toggleClass, getDomNodePagePosition } from 'vs/base/browser/dom';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { IDelegate, IListEvent, IRenderer } from 'vs/base/browser/ui/list/list';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationChangedEvent } from 'vs/editor/common/config/editorOptions';
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { Context as SuggestContext } from './suggest';
import { ICompletionItem, CompletionModel } from './completionModel';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { attachListStyler } from 'vs/platform/theme/common/styler';
import { IThemeService, ITheme, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { registerColor, editorWidgetBackground, listFocusBackground, activeContrastBorder, listHighlightForeground, editorForeground, editorWidgetBorder } from 'vs/platform/theme/common/colorRegistry';

const sticky = false; // for development purposes

interface ISuggestionTemplateData {
	root: HTMLElement;
	icon: HTMLElement;
	colorspan: HTMLElement;
	highlightedLabel: HighlightedLabel;
	disposables: IDisposable[];
}

/**
 * Suggest widget colors
 */
export const editorSuggestWidgetBackground = registerColor('editorSuggestWidget.background', { dark: editorWidgetBackground, light: editorWidgetBackground, hc: editorWidgetBackground }, nls.localize('editorSuggestWidgetBackground', 'Background color of the suggest widget.'));
export const editorSuggestWidgetBorder = registerColor('editorSuggestWidget.border', { dark: editorWidgetBorder, light: editorWidgetBorder, hc: editorWidgetBorder }, nls.localize('editorSuggestWidgetBorder', 'Border color of the suggest widget.'));
export const editorSuggestWidgetForeground = registerColor('editorSuggestWidget.foreground', { dark: editorForeground, light: editorForeground, hc: editorForeground }, nls.localize('editorSuggestWidgetForeground', 'Foreground color of the suggest widget.'));
export const editorSuggestWidgetSelectedBackground = registerColor('editorSuggestWidget.selectedBackground', { dark: listFocusBackground, light: listFocusBackground, hc: listFocusBackground }, nls.localize('editorSuggestWidgetSelectedBackground', 'Background color of the selected entry in the suggest widget.'));
export const editorSuggestWidgetHighlightForeground = registerColor('editorSuggestWidget.highlightForeground', { dark: listHighlightForeground, light: listHighlightForeground, hc: listHighlightForeground }, nls.localize('editorSuggestWidgetHighlightForeground', 'Color of the match highlights in the suggest widget.'));


const colorRegExp = /^(#([\da-f]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))$/i;
function matchesColor(text: string) {
	return text && text.match(colorRegExp) ? text : null;
}

function canExpandCompletionItem(item: ICompletionItem) {
	const suggestion = item.suggestion;
	if (suggestion.documentation) {
		return true;
	}
	return (suggestion.detail && suggestion.detail !== suggestion.label);
}

class Renderer implements IRenderer<ICompletionItem, ISuggestionTemplateData> {

	private triggerKeybindingLabel: string;

	constructor(
		private widget: SuggestWidget,
		private editor: ICodeEditor,
		@IKeybindingService keybindingService: IKeybindingService
	) {
		const kb = keybindingService.lookupKeybinding('editor.action.triggerSuggest');
		this.triggerKeybindingLabel = !kb ? '' : ` (${kb.getLabel()})`;
	}

	get templateId(): string {
		return 'suggestion';
	}

	renderTemplate(container: HTMLElement): ISuggestionTemplateData {
		const data = <ISuggestionTemplateData>Object.create(null);
		data.disposables = [];
		data.root = container;

		data.icon = append(container, $('.icon'));
		data.colorspan = append(data.icon, $('span.colorspan'));

		const text = append(container, $('.contents'));
		const main = append(text, $('.main'));
		data.highlightedLabel = new HighlightedLabel(main);
		data.disposables.push(data.highlightedLabel);
		const configureFont = () => {
			const configuration = this.editor.getConfiguration();
			const fontFamily = configuration.fontInfo.fontFamily;
			const fontSize = configuration.contribInfo.suggestFontSize || configuration.fontInfo.fontSize;
			const lineHeight = configuration.contribInfo.suggestLineHeight || configuration.fontInfo.lineHeight;
			const fontSizePx = `${fontSize}px`;
			const lineHeightPx = `${lineHeight}px`;

			data.root.style.fontSize = fontSizePx;
			main.style.fontFamily = fontFamily;
			main.style.lineHeight = lineHeightPx;
			data.icon.style.height = lineHeightPx;
			data.icon.style.width = lineHeightPx;
		};

		configureFont();

		chain<IConfigurationChangedEvent>(this.editor.onDidChangeConfiguration.bind(this.editor))
			.filter(e => e.fontInfo || e.contribInfo)
			.on(configureFont, null, data.disposables);

		return data;
	}

	renderElement(element: ICompletionItem, index: number, templateData: ISuggestionTemplateData): void {
		const data = <ISuggestionTemplateData>templateData;
		const suggestion = (<ICompletionItem>element).suggestion;

		if (canExpandCompletionItem(element)) {
			data.root.setAttribute('aria-label', nls.localize('suggestionWithDetailsAriaLabel', "{0}, suggestion, has details", suggestion.label));
		} else {
			data.root.setAttribute('aria-label', nls.localize('suggestionAriaLabel', "{0}, suggestion", suggestion.label));
		}

		data.icon.className = 'icon ' + suggestion.type;
		data.colorspan.style.backgroundColor = '';

		if (suggestion.type === 'color') {
			let color = matchesColor(suggestion.label) || matchesColor(suggestion.documentation);
			if (color) {
				data.icon.className = 'icon customcolor';
				data.colorspan.style.backgroundColor = color;
			}
		}

		data.highlightedLabel.set(suggestion.label, createMatches(element.matches));


	}

	disposeTemplate(templateData: ISuggestionTemplateData): void {
		templateData.highlightedLabel.dispose();
		templateData.disposables = dispose(templateData.disposables);
	}
}

const enum State {
	Hidden,
	Loading,
	Empty,
	Open,
	Frozen,
	Details
}

class SuggestionDetails {

	private el: HTMLElement;
	private scrollbar: DomScrollableElement;
	private body: HTMLElement;
	private type: HTMLElement;
	private docs: HTMLElement;
	private ariaLabel: string;
	private disposables: IDisposable[];

	constructor(
		container: HTMLElement,
		private widget: SuggestWidget,
		private editor: ICodeEditor
	) {
		this.disposables = [];

		this.el = append(container, $('.details'));
		this.disposables.push(toDisposable(() => container.removeChild(this.el)));

		this.body = $('.body');

		this.scrollbar = new DomScrollableElement(this.body, { canUseTranslate3d: false });
		append(this.el, this.scrollbar.getDomNode());
		this.disposables.push(this.scrollbar);

		this.type = append(this.body, $('p.type'));
		this.docs = append(this.body, $('p.docs'));
		this.ariaLabel = null;

		this.configureFont();

		chain<IConfigurationChangedEvent>(this.editor.onDidChangeConfiguration.bind(this.editor))
			.filter(e => e.fontInfo)
			.on(this.configureFont, this, this.disposables);
	}

	get element() {
		return this.el;
	}

	render(item: ICompletionItem): void {
		if (!item || !canExpandCompletionItem(item)) {
			this.type.textContent = '';
			this.docs.textContent = '';
			addClass(this.el, 'no-docs');
			this.ariaLabel = null;
			return;
		}
		removeClass(this.el, 'no-docs');
		this.type.innerText = item.suggestion.detail || '';
		this.docs.textContent = item.suggestion.documentation;

		this.el.style.height = this.type.clientHeight + this.docs.clientHeight + 'px';

		this.body.scrollTop = 0;
		this.scrollbar.scanDomNode();

		this.ariaLabel = strings.format('{0}\n{1}\n{2}', item.suggestion.label || '', item.suggestion.detail || '', item.suggestion.documentation || '');
	}

	getAriaLabel(): string {
		return this.ariaLabel;
	}

	scrollDown(much = 8): void {
		this.body.scrollTop += much;
	}

	scrollUp(much = 8): void {
		this.body.scrollTop -= much;
	}

	scrollTop(): void {
		this.body.scrollTop = 0;
	}

	scrollBottom(): void {
		this.body.scrollTop = this.body.scrollHeight;
	}

	pageDown(): void {
		this.scrollDown(80);
	}

	pageUp(): void {
		this.scrollUp(80);
	}

	private configureFont() {
		const configuration = this.editor.getConfiguration();
		const fontFamily = configuration.fontInfo.fontFamily;
		const fontSize = configuration.contribInfo.suggestFontSize || configuration.fontInfo.fontSize;
		const fontSizePx = `${fontSize}px`;

		this.el.style.fontSize = fontSizePx;
		this.type.style.fontFamily = fontFamily;
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);
	}
}

export class SuggestWidget implements IContentWidget, IDelegate<ICompletionItem>, IDisposable {

	private static ID: string = 'editor.widget.suggestWidget';

	static LOADING_MESSAGE: string = nls.localize('suggestWidget.loading', "Loading...");
	static NO_SUGGESTIONS_MESSAGE: string = nls.localize('suggestWidget.noSuggestions', "No suggestions.");

	// Editor.IContentWidget.allowEditorOverflow
	readonly allowEditorOverflow = true;

	private state: State;
	private isAuto: boolean;
	private loadingTimeout: number;
	private currentSuggestionDetails: TPromise<void>;
	private focusedItemIndex: number;
	private focusedItem: ICompletionItem;
	private ignoreFocusEvents = false;
	private completionModel: CompletionModel;

	private element: HTMLElement;
	private messageElement: HTMLElement;
	private listElement: HTMLElement;
	private details: SuggestionDetails;
	private list: List<ICompletionItem>;

	private suggestWidgetVisible: IContextKey<boolean>;
	private suggestWidgetMultipleSuggestions: IContextKey<boolean>;
	private suggestionSupportsAutoAccept: IContextKey<boolean>;

	private editorBlurTimeout: TPromise<void>;
	private showTimeout: TPromise<void>;
	private toDispose: IDisposable[];

	private onDidSelectEmitter = new Emitter<ICompletionItem>();
	private onDidFocusEmitter = new Emitter<ICompletionItem>();
	private onDidHideEmitter = new Emitter<this>();
	private onDidShowEmitter = new Emitter<this>();


	readonly onDidSelect: Event<ICompletionItem> = this.onDidSelectEmitter.event;
	readonly onDidFocus: Event<ICompletionItem> = this.onDidFocusEmitter.event;
	readonly onDidHide: Event<this> = this.onDidHideEmitter.event;
	readonly onDidShow: Event<this> = this.onDidShowEmitter.event;

	private readonly maxWidgetWidth = 660;
	private readonly listWidth = 330;
	private readonly minWidgetWidth = 400;

	constructor(
		private editor: ICodeEditor,
		@ITelemetryService private telemetryService: ITelemetryService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService
	) {
		this.isAuto = false;
		this.focusedItem = null;

		this.element = $('.editor-widget.suggest-widget');

		if (!this.editor.getConfiguration().contribInfo.iconsInSuggestions) {
			addClass(this.element, 'no-icons');
		}

		this.messageElement = append(this.element, $('.message'));
		this.listElement = append(this.element, $('.tree'));
		this.details = new SuggestionDetails(this.element, this, this.editor);

		let renderer: IRenderer<ICompletionItem, any> = instantiationService.createInstance(Renderer, this, this.editor);

		this.list = new List(this.listElement, this, [renderer], {
			useShadows: false,
			selectOnMouseDown: true
		});

		this.toDispose = [
			attachListStyler(this.list, themeService, {
				listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
				listInactiveFocusOutline: activeContrastBorder
			}),
			themeService.onThemeChange(t => this.onThemeChange(t)),
			editor.onDidBlurEditorText(() => this.onEditorBlur()),
			this.list.onSelectionChange(e => this.onListSelection(e)),
			this.list.onFocusChange(e => this.onListFocus(e)),
			this.editor.onDidChangeCursorSelection(() => this.onCursorSelectionChanged())
		];

		this.suggestWidgetVisible = SuggestContext.Visible.bindTo(contextKeyService);
		this.suggestWidgetMultipleSuggestions = SuggestContext.MultipleSuggestions.bindTo(contextKeyService);
		this.suggestionSupportsAutoAccept = SuggestContext.AcceptOnKey.bindTo(contextKeyService);

		this.editor.addContentWidget(this);
		this.setState(State.Hidden);

		this.onThemeChange(themeService.getTheme());

		// TODO@Alex: this is useful, but spammy
		// var isVisible = false;
		// this.onDidVisibilityChange((newIsVisible) => {
		// 	if (isVisible === newIsVisible) {
		// 		return;
		// 	}
		// 	isVisible = newIsVisible;
		// 	if (isVisible) {
		// 		alert(nls.localize('suggestWidgetAriaVisible', "Suggestions opened"));
		// 	} else {
		// 		alert(nls.localize('suggestWidgetAriaInvisible', "Suggestions closed"));
		// 	}
		// });
	}

	private onCursorSelectionChanged(): void {
		if (this.state === State.Hidden) {
			return;
		}

		this.editor.layoutContentWidget(this);
	}

	private onEditorBlur(): void {
		if (sticky) {
			return;
		}

		this.editorBlurTimeout = TPromise.timeout(150).then(() => {
			if (!this.editor.isFocused()) {
				this.setState(State.Hidden);
			}
		});
	}

	private onListSelection(e: IListEvent<ICompletionItem>): void {
		if (!e.elements.length) {
			return;
		}

		const item = e.elements[0];
		this.onDidSelectEmitter.fire(item);

		alert(nls.localize('suggestionAriaAccepted', "{0}, accepted", item.suggestion.label));

		this.editor.focus();
	}

	private _getSuggestionAriaAlertLabel(item: ICompletionItem): string {
		if (canExpandCompletionItem(item)) {
			return nls.localize('ariaCurrentSuggestionWithDetails', "{0}, suggestion, has details", item.suggestion.label);
		} else {
			return nls.localize('ariaCurrentSuggestion', "{0}, suggestion", item.suggestion.label);
		}
	}

	private _lastAriaAlertLabel: string;
	private _ariaAlert(newAriaAlertLabel: string): void {
		if (this._lastAriaAlertLabel === newAriaAlertLabel) {
			return;
		}
		this._lastAriaAlertLabel = newAriaAlertLabel;
		if (this._lastAriaAlertLabel) {
			alert(this._lastAriaAlertLabel);
		}
	}

	private onThemeChange(theme: ITheme) {
		let backgroundColor = theme.getColor(editorSuggestWidgetBackground);
		if (backgroundColor) {
			this.listElement.style.backgroundColor = backgroundColor.toString();
			this.details.element.style.backgroundColor = backgroundColor.toString();
			this.messageElement.style.backgroundColor = backgroundColor.toString();
		}
		let borderColor = theme.getColor(editorSuggestWidgetBorder);
		if (borderColor) {
			let borderWidth = theme.type === 'hc' ? 2 : 1;
			this.listElement.style.border = `${borderWidth}px solid ${borderColor}`;
			this.details.element.style.border = `${borderWidth}px solid ${borderColor}`;
			this.messageElement.style.border = `${borderWidth}px solid ${borderColor}`;
		}
	}

	private onListFocus(e: IListEvent<ICompletionItem>): void {
		if (this.ignoreFocusEvents) {
			return;
		}

		if (!e.elements.length) {
			if (this.currentSuggestionDetails) {
				this.currentSuggestionDetails.cancel();
				this.currentSuggestionDetails = null;
				this.focusedItem = null;
			}

			this._ariaAlert(null);
			// TODO@Alex: Chromium bug
			// this.editor.setAriaActiveDescendant(null);

			return;
		}

		const item = e.elements[0];
		this._ariaAlert(this._getSuggestionAriaAlertLabel(item));

		// TODO@Alex: Chromium bug
		// // TODO@Alex: the list is not done rendering...
		// setTimeout(() => {
		// 	this.editor.setAriaActiveDescendant(this.list.getElementId(e.indexes[0]));
		// }, 100);

		if (item === this.focusedItem) {
			return;
		}

		if (this.currentSuggestionDetails) {
			this.currentSuggestionDetails.cancel();
			this.currentSuggestionDetails = null;
		}

		const index = e.indexes[0];

		this.suggestionSupportsAutoAccept.set(!item.suggestion.noAutoAccept);

		const oldFocus = this.focusedItem;
		const oldFocusIndex = this.focusedItemIndex;
		this.focusedItemIndex = index;
		this.focusedItem = item;

		if (oldFocus) {
			this.ignoreFocusEvents = true;
			this.list.splice(oldFocusIndex, 1, [oldFocus]);
			this.ignoreFocusEvents = false;
		}

		this.updateWidgetHeight();
		this.list.reveal(index);

		this.currentSuggestionDetails = item.resolve()
			.then(() => {
				this.ignoreFocusEvents = true;
				this.list.splice(index, 1, [item]);
				this.ignoreFocusEvents = false;

				this.list.setFocus([index]);
				this.list.reveal(index);
				this.showDetails();
				this.adjustDocsPosition();
				this._ariaAlert(this._getSuggestionAriaAlertLabel(item));
			})
			.then(null, err => !isPromiseCanceledError(err) && onUnexpectedError(err))
			.then(() => this.currentSuggestionDetails = null);

		// emit an event
		this.onDidFocusEmitter.fire(item);
	}

	private setState(state: State): void {
		if (!this.element) {
			return;
		}

		const stateChanged = this.state !== state;
		this.state = state;

		toggleClass(this.element, 'frozen', state === State.Frozen);

		switch (state) {
			case State.Hidden:
				hide(this.messageElement, this.details.element);
				show(this.listElement);
				this.hide();
				if (stateChanged) {
					this.list.splice(0, this.list.length);
				}
				break;
			case State.Loading:
				this.messageElement.textContent = SuggestWidget.LOADING_MESSAGE;
				hide(this.listElement, this.details.element);
				show(this.messageElement);
				this.show();
				break;
			case State.Empty:
				this.messageElement.textContent = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
				hide(this.listElement, this.details.element);
				show(this.messageElement);
				this.show();
				break;
			case State.Open:
				hide(this.messageElement);
				show(this.listElement, this.details.element);
				this.show();
				break;
			case State.Frozen:
				hide(this.messageElement, this.details.element);
				show(this.listElement);
				this.show();
				break;
			case State.Details:
				hide(this.messageElement);
				show(this.details.element, this.listElement);
				this.show();
				this._ariaAlert(this.details.getAriaLabel());
				break;
		}

		if (stateChanged) {
			this.editor.layoutContentWidget(this);
		}
	}

	showTriggered(auto: boolean) {
		if (this.state !== State.Hidden) {
			return;
		}

		this.isAuto = !!auto;

		if (!this.isAuto) {
			this.loadingTimeout = setTimeout(() => {
				this.loadingTimeout = null;
				this.setState(State.Loading);
			}, 50);
		}
	}

	showSuggestions(completionModel: CompletionModel, isFrozen: boolean, isAuto: boolean): void {
		if (this.loadingTimeout) {
			clearTimeout(this.loadingTimeout);
			this.loadingTimeout = null;
		}

		this.completionModel = completionModel;

		if (isFrozen && this.state !== State.Empty && this.state !== State.Hidden) {
			this.setState(State.Frozen);
			return;
		}

		let visibleCount = this.completionModel.items.length;

		const isEmpty = visibleCount === 0;
		this.suggestWidgetMultipleSuggestions.set(visibleCount > 1);

		if (isEmpty) {
			if (isAuto) {
				this.setState(State.Hidden);
			} else {
				this.setState(State.Empty);
			}

			this.completionModel = null;

		} else {
			const { stats } = this.completionModel;
			stats['wasAutomaticallyTriggered'] = !!isAuto;
			this.telemetryService.publicLog('suggestWidget', { ...stats, ...this.editor.getTelemetryData() });

			this.focusedItem = null;
			this.focusedItemIndex = null;
			this.list.splice(0, this.list.length, this.completionModel.items);
			this.list.setFocus([0]);
			this.list.reveal(0, 0);

			if (isFrozen) {
				this.setState(State.Frozen);
			} else {
				this.setState(State.Open);
			}
		}
	}

	selectNextPage(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.details.pageDown();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusNextPage();
				return true;
		}
	}

	selectNext(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.list.focusNext(1, true);
				this.renderDetails();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusNext(1, true);
				return true;
		}
	}

	selectLast(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.details.scrollBottom();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusLast();
				return true;
		}
	}

	selectPreviousPage(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.details.pageUp();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusPreviousPage();
				return true;
		}
	}

	selectPrevious(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.list.focusPrevious(1, true);
				this.renderDetails();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusPrevious(1, true);
				return false;
		}
	}

	selectFirst(): boolean {
		switch (this.state) {
			case State.Hidden:
				return false;
			case State.Details:
				this.details.scrollTop();
				return true;
			case State.Loading:
				return !this.isAuto;
			default:
				this.list.focusFirst();
				return true;
		}
	}

	getFocusedItem(): ICompletionItem {
		if (this.state !== State.Hidden
			&& this.state !== State.Empty
			&& this.state !== State.Loading) {

			return this.list.getFocusedElements()[0];
		}
		return undefined;
	}

	toggleDetailsFocus(): void {
		if (this.state === State.Details) {
			this.setState(State.Open);
		} else if (this.state === State.Open) {
			this.setState(State.Details);
		}
	}

	showDetails(): void {
		if (this.state !== State.Open && this.state !== State.Details) {
			return;
		}

		this.show();
		this.editor.focus();
	}

	private show(): void {
		this.updateWidgetHeight();
		this.suggestWidgetVisible.set(true);
		this.renderDetails();
		this.showTimeout = TPromise.timeout(100).then(() => {
			addClass(this.element, 'visible');
			this.onDidShowEmitter.fire(this);
		});
	}

	private hide(): void {
		this.suggestWidgetVisible.reset();
		this.suggestWidgetMultipleSuggestions.reset();
		removeClass(this.element, 'visible');
	}

	hideWidget(): void {
		clearTimeout(this.loadingTimeout);
		this.setState(State.Hidden);
		this.onDidHideEmitter.fire(this);
	}

	getPosition(): IContentWidgetPosition {
		if (this.state === State.Hidden) {
			return null;
		}

		return {
			position: this.editor.getPosition(),
			preference: [ContentWidgetPositionPreference.BELOW, ContentWidgetPositionPreference.ABOVE]
		};
	}

	getDomNode(): HTMLElement {
		return this.element;
	}

	getId(): string {
		return SuggestWidget.ID;
	}

	private updateWidgetHeight(): number {
		let height = 0;
		let maxSuggestionsToShow = this.editor.getLayoutInfo().contentWidth > this.minWidgetWidth ? 11 : 5;

		if (this.state === State.Empty || this.state === State.Loading) {
			height = this.unfocusedHeight;
		} else {
			const focus = this.list.getFocusedElements()[0];
			const focusHeight = focus ? this.getHeight(focus) : this.unfocusedHeight;
			height = focusHeight;

			const suggestionCount = (this.list.contentHeight - focusHeight) / this.unfocusedHeight;
			height += Math.min(suggestionCount, maxSuggestionsToShow) * this.unfocusedHeight;
		}

		this.element.style.lineHeight = `${this.unfocusedHeight}px`;
		this.listElement.style.height = `${height}px`;
		this.list.layout(height);

		this.adjustWidgetWidth();
		this.editor.layoutContentWidget(this);

		return height;
	}

	private adjustWidgetWidth() {

		// Message element is shown, list and docs are not
		if (this.messageElement.style.display !== 'none'
			&& this.details.element.style.display === 'none'
			&& this.listElement.style.display === 'none') {
			addClass(this.element, 'small');
			return;
		}

		let matches = this.element.style.maxWidth.match(/(\d+)px/);
		if (!matches || Number(matches[1]) >= this.maxWidgetWidth) {
			// Reset width
			removeClass(this.element, 'small');
		}

		// Reset list margin
		this.listElement.style.marginTop = '0px';
	}

	private adjustDocsPosition() {
		const cursorCoords = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
		const editorCoords = getDomNodePagePosition(this.editor.getDomNode());
		const cursorX = editorCoords.left + cursorCoords.left;
		const cursorY = editorCoords.top + cursorCoords.top + cursorCoords.height;
		const widgetX = this.element.offsetLeft;
		const widgetY = this.element.offsetTop;

		removeClass(this.element, 'list-right');

		if (this.element.clientWidth < this.maxWidgetWidth && this.listElement.clientWidth !== this.minWidgetWidth) {
			// Not enough space to show side by side, so show docs below the list
			addClass(this.element, 'small');
			return;
		}

		if (widgetX < cursorX - this.listWidth) {
			// Widget is too far to the left of cursor, swap list and docs
			addClass(this.element, 'list-right');
		}

		if (cursorY > widgetY && this.details.element.clientHeight > this.listElement.clientHeight) {
			// Docs is bigger than list and widget is above cursor, apply margin-top so that list appears right above cursor
			this.listElement.style.marginTop = `${this.details.element.clientHeight - this.listElement.clientHeight}px`;
		}
	}

	private renderDetails(): void {
		if (this.state === State.Details || this.state === State.Open) {
			this.details.render(this.list.getFocusedElements()[0]);
		} else {
			this.details.render(null);
		}
	}

	// Heights

	private get focusHeight(): number {
		return this.unfocusedHeight * 2;
	}

	private get unfocusedHeight(): number {
		const configuration = this.editor.getConfiguration();
		return configuration.contribInfo.suggestLineHeight || configuration.fontInfo.lineHeight;
	}

	// IDelegate

	getHeight(element: ICompletionItem): number {
		return this.unfocusedHeight;
	}

	getTemplateId(element: ICompletionItem): string {
		return 'suggestion';
	}

	dispose(): void {
		this.state = null;
		this.suggestionSupportsAutoAccept = null;
		this.currentSuggestionDetails = null;
		this.focusedItem = null;
		this.element = null;
		this.messageElement = null;
		this.listElement = null;
		this.details.dispose();
		this.details = null;
		this.list.dispose();
		this.list = null;
		this.toDispose = dispose(this.toDispose);
		if (this.loadingTimeout) {
			clearTimeout(this.loadingTimeout);
			this.loadingTimeout = null;
		}

		if (this.editorBlurTimeout) {
			this.editorBlurTimeout.cancel();
			this.editorBlurTimeout = null;
		}

		if (this.showTimeout) {
			this.showTimeout.cancel();
			this.showTimeout = null;
		}
	}
}

registerThemingParticipant((theme, collector) => {
	let matchHighlight = theme.getColor(editorSuggestWidgetHighlightForeground);
	if (matchHighlight) {
		collector.addRule(`.monaco-editor .suggest-widget:not(.frozen) .monaco-highlighted-label .highlight { color: ${matchHighlight}; }`);
	}
	let foreground = theme.getColor(editorSuggestWidgetForeground);
	if (foreground) {
		collector.addRule(`.monaco-editor .suggest-widget { color: ${foreground}; }`);
	}
});
