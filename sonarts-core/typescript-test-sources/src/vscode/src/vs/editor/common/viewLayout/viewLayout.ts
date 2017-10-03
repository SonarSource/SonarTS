/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Disposable } from 'vs/base/common/lifecycle';
import { Scrollable, ScrollState, ScrollEvent, ScrollbarVisibility } from 'vs/base/common/scrollable';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { LinesLayout } from 'vs/editor/common/viewLayout/linesLayout';
import { IViewLayout, IViewWhitespaceViewportData, Viewport } from 'vs/editor/common/viewModel/viewModel';
import { IPartialViewLinesViewportData } from 'vs/editor/common/viewLayout/viewLinesViewportData';
import { IEditorWhitespace } from 'vs/editor/common/viewLayout/whitespaceComputer';
import Event from 'vs/base/common/event';
import { IConfigurationChangedEvent } from "vs/editor/common/config/editorOptions";

export class ViewLayout extends Disposable implements IViewLayout {

	static LINES_HORIZONTAL_EXTRA_PX = 30;

	private readonly _configuration: editorCommon.IConfiguration;
	private readonly _linesLayout: LinesLayout;

	public readonly scrollable: Scrollable;
	public readonly onDidScroll: Event<ScrollEvent>;

	constructor(configuration: editorCommon.IConfiguration, lineCount: number) {
		super();

		this._configuration = configuration;
		this._linesLayout = new LinesLayout(lineCount, this._configuration.editor.lineHeight);

		this.scrollable = this._register(new Scrollable());
		this.scrollable.updateState({
			width: configuration.editor.layoutInfo.contentWidth,
			height: configuration.editor.layoutInfo.contentHeight
		});
		this.onDidScroll = this.scrollable.onScroll;

		this._updateHeight();
	}

	public dispose(): void {
		super.dispose();
	}

	public getScrollable(): Scrollable {
		return this.scrollable;
	}

	public onHeightMaybeChanged(): void {
		this._updateHeight();
	}

	// ---- begin view event handlers

	public onConfigurationChanged(e: IConfigurationChangedEvent): void {
		if (e.lineHeight) {
			this._linesLayout.setLineHeight(this._configuration.editor.lineHeight);
		}
		if (e.layoutInfo) {
			this.scrollable.updateState({
				width: this._configuration.editor.layoutInfo.contentWidth,
				height: this._configuration.editor.layoutInfo.contentHeight
			});
		}
		this._updateHeight();
	}
	public onFlushed(lineCount: number): void {
		this._linesLayout.onFlushed(lineCount);
		this._updateHeight();
	}
	public onLinesDeleted(fromLineNumber: number, toLineNumber: number): void {
		this._linesLayout.onLinesDeleted(fromLineNumber, toLineNumber);
		this._updateHeight();
	}
	public onLinesInserted(fromLineNumber: number, toLineNumber: number): void {
		this._linesLayout.onLinesInserted(fromLineNumber, toLineNumber);
		this._updateHeight();
	}

	// ---- end view event handlers

	private _getHorizontalScrollbarHeight(scrollState: ScrollState): number {
		if (this._configuration.editor.viewInfo.scrollbar.horizontal === ScrollbarVisibility.Hidden) {
			// horizontal scrollbar not visible
			return 0;
		}
		if (scrollState.width >= scrollState.scrollWidth) {
			// horizontal scrollbar not visible
			return 0;
		}
		return this._configuration.editor.viewInfo.scrollbar.horizontalScrollbarSize;
	}

	private _getTotalHeight(): number {
		const scrollState = this.scrollable.getState();

		let result = this._linesLayout.getLinesTotalHeight();
		if (this._configuration.editor.viewInfo.scrollBeyondLastLine) {
			result += scrollState.height - this._configuration.editor.lineHeight;
		} else {
			result += this._getHorizontalScrollbarHeight(scrollState);
		}

		return Math.max(scrollState.height, result);
	}

	private _updateHeight(): void {
		this.scrollable.updateState({
			scrollHeight: this._getTotalHeight()
		});
	}

	// ---- Layouting logic

	public getCurrentViewport(): Viewport {
		const scrollState = this.scrollable.getState();
		return new Viewport(
			scrollState.scrollTop,
			scrollState.scrollLeft,
			scrollState.width,
			scrollState.height
		);
	}

	private _computeScrollWidth(maxLineWidth: number, viewportWidth: number): number {
		let isViewportWrapping = this._configuration.editor.wrappingInfo.isViewportWrapping;
		if (!isViewportWrapping) {
			return Math.max(maxLineWidth + ViewLayout.LINES_HORIZONTAL_EXTRA_PX, viewportWidth);
		}
		return Math.max(maxLineWidth, viewportWidth);
	}

	public onMaxLineWidthChanged(maxLineWidth: number): void {
		let newScrollWidth = this._computeScrollWidth(maxLineWidth, this.getCurrentViewport().width);
		this.scrollable.updateState({
			scrollWidth: newScrollWidth
		});

		// The height might depend on the fact that there is a horizontal scrollbar or not
		this._updateHeight();
	}

	// ---- view state

	public saveState(): editorCommon.IViewState {
		const scrollState = this.scrollable.getState();
		let scrollTop = scrollState.scrollTop;
		let firstLineNumberInViewport = this._linesLayout.getLineNumberAtOrAfterVerticalOffset(scrollTop);
		let whitespaceAboveFirstLine = this._linesLayout.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
		return {
			scrollTop: scrollTop,
			scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
			scrollLeft: scrollState.scrollLeft
		};
	}

	public restoreState(state: editorCommon.IViewState): void {
		let restoreScrollTop = state.scrollTop;
		if (typeof state.scrollTopWithoutViewZones === 'number' && !this._linesLayout.hasWhitespace()) {
			restoreScrollTop = state.scrollTopWithoutViewZones;
		}
		this.scrollable.updateState({
			scrollLeft: state.scrollLeft,
			scrollTop: restoreScrollTop
		});
	}

	// ---- IVerticalLayoutProvider

	public addWhitespace(afterLineNumber: number, ordinal: number, height: number): number {
		return this._linesLayout.insertWhitespace(afterLineNumber, ordinal, height);
	}
	public changeWhitespace(id: number, newAfterLineNumber: number, newHeight: number): boolean {
		return this._linesLayout.changeWhitespace(id, newAfterLineNumber, newHeight);
	}
	public removeWhitespace(id: number): boolean {
		return this._linesLayout.removeWhitespace(id);
	}
	public getVerticalOffsetForLineNumber(lineNumber: number): number {
		return this._linesLayout.getVerticalOffsetForLineNumber(lineNumber);
	}
	public isAfterLines(verticalOffset: number): boolean {
		return this._linesLayout.isAfterLines(verticalOffset);
	}
	public getLineNumberAtVerticalOffset(verticalOffset: number): number {
		return this._linesLayout.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
	}

	public getWhitespaceAtVerticalOffset(verticalOffset: number): IViewWhitespaceViewportData {
		return this._linesLayout.getWhitespaceAtVerticalOffset(verticalOffset);
	}
	public getLinesViewportData(): IPartialViewLinesViewportData {
		const visibleBox = this.getCurrentViewport();
		return this._linesLayout.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
	}
	public getLinesViewportDataAtScrollTop(scrollTop: number): IPartialViewLinesViewportData {
		// do some minimal validations on scrollTop
		const scrollState = this.scrollable.getState();
		if (scrollTop + scrollState.height > scrollState.scrollHeight) {
			scrollTop = scrollState.scrollHeight - scrollState.height;
		}
		if (scrollTop < 0) {
			scrollTop = 0;
		}
		return this._linesLayout.getLinesViewportData(scrollTop, scrollTop + scrollState.height);
	}
	public getWhitespaceViewportData(): IViewWhitespaceViewportData[] {
		const visibleBox = this.getCurrentViewport();
		return this._linesLayout.getWhitespaceViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
	}
	public getWhitespaces(): IEditorWhitespace[] {
		return this._linesLayout.getWhitespaces();
	}

	// ---- IScrollingProvider


	public getScrollWidth(): number {
		const scrollState = this.scrollable.getState();
		return scrollState.scrollWidth;
	}
	public getScrollLeft(): number {
		const scrollState = this.scrollable.getState();
		return scrollState.scrollLeft;
	}
	public getScrollHeight(): number {
		const scrollState = this.scrollable.getState();
		return scrollState.scrollHeight;
	}
	public getScrollTop(): number {
		const scrollState = this.scrollable.getState();
		return scrollState.scrollTop;
	}

	public setScrollPosition(position: editorCommon.INewScrollPosition): void {
		this.scrollable.updateState(position);
	}
}
