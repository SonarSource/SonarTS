/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./lineNumbers';
import { editorLineNumbers } from 'vs/editor/common/view/editorColorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import * as platform from 'vs/base/common/platform';
import { DynamicViewOverlay } from 'vs/editor/browser/view/dynamicViewOverlay';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import { RenderingContext } from 'vs/editor/common/view/renderingContext';
import * as viewEvents from 'vs/editor/common/view/viewEvents';
import { Position } from 'vs/editor/common/core/position';

export class LineNumbersOverlay extends DynamicViewOverlay {

	public static CLASS_NAME = 'line-numbers';

	private _context: ViewContext;

	private _lineHeight: number;
	private _renderLineNumbers: boolean;
	private _renderCustomLineNumbers: (lineNumber: number) => string;
	private _renderRelativeLineNumbers: boolean;
	private _lineNumbersLeft: number;
	private _lineNumbersWidth: number;

	private _lastCursorModelPosition: Position;
	private _renderResult: string[];

	constructor(context: ViewContext) {
		super();
		this._context = context;

		this._readConfig();

		this._lastCursorModelPosition = new Position(1, 1);
		this._renderResult = null;
		this._context.addEventHandler(this);
	}

	private _readConfig(): void {
		const config = this._context.configuration.editor;
		this._lineHeight = config.lineHeight;
		this._renderLineNumbers = config.viewInfo.renderLineNumbers;
		this._renderCustomLineNumbers = config.viewInfo.renderCustomLineNumbers;
		this._renderRelativeLineNumbers = config.viewInfo.renderRelativeLineNumbers;
		this._lineNumbersLeft = config.layoutInfo.lineNumbersLeft;
		this._lineNumbersWidth = config.layoutInfo.lineNumbersWidth;
	}

	public dispose(): void {
		this._context.removeEventHandler(this);
		this._context = null;
		this._renderResult = null;
		super.dispose();
	}

	// --- begin event handlers

	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		this._readConfig();
		return true;
	}
	public onCursorPositionChanged(e: viewEvents.ViewCursorPositionChangedEvent): boolean {
		this._lastCursorModelPosition = this._context.model.coordinatesConverter.convertViewPositionToModelPosition(e.position);

		if (this._renderRelativeLineNumbers) {
			return true;
		}
		return false;
	}
	public onFlushed(e: viewEvents.ViewFlushedEvent): boolean {
		return true;
	}
	public onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean {
		return true;
	}
	public onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean {
		return true;
	}
	public onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean {
		return true;
	}
	public onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean {
		return e.scrollTopChanged;
	}
	public onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean {
		return true;
	}

	// --- end event handlers

	private _getLineRenderLineNumber(viewLineNumber: number): string {
		const modelPosition = this._context.model.coordinatesConverter.convertViewPositionToModelPosition(new Position(viewLineNumber, 1));
		if (modelPosition.column !== 1) {
			return '';
		}
		let modelLineNumber = modelPosition.lineNumber;

		if (this._renderCustomLineNumbers) {
			return this._renderCustomLineNumbers(modelLineNumber);
		}

		if (this._renderRelativeLineNumbers) {
			let diff = Math.abs(this._lastCursorModelPosition.lineNumber - modelLineNumber);
			if (diff === 0) {
				return '<span class="relative-current-line-number">' + modelLineNumber + '</span>';
			}
			return String(diff);
		}

		return String(modelLineNumber);
	}

	public prepareRender(ctx: RenderingContext): void {
		if (!this._renderLineNumbers) {
			this._renderResult = null;
			return;
		}

		let lineHeightClassName = (platform.isLinux ? (this._lineHeight % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
		let visibleStartLineNumber = ctx.visibleRange.startLineNumber;
		let visibleEndLineNumber = ctx.visibleRange.endLineNumber;
		let common = '<div class="' + LineNumbersOverlay.CLASS_NAME + lineHeightClassName + '" style="left:' + this._lineNumbersLeft.toString() + 'px;width:' + this._lineNumbersWidth.toString() + 'px;">';

		let output: string[] = [];
		for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
			let lineIndex = lineNumber - visibleStartLineNumber;

			let renderLineNumber = this._getLineRenderLineNumber(lineNumber);
			if (renderLineNumber) {
				output[lineIndex] = (
					common
					+ renderLineNumber
					+ '</div>'
				);
			} else {
				output[lineIndex] = '';
			}
		}

		this._renderResult = output;
	}

	public render(startLineNumber: number, lineNumber: number): string {
		if (!this._renderResult) {
			return '';
		}
		let lineIndex = lineNumber - startLineNumber;
		if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
			throw new Error('Unexpected render request');
		}
		return this._renderResult[lineIndex];
	}
}

// theming

registerThemingParticipant((theme, collector) => {
	let lineNumbers = theme.getColor(editorLineNumbers);
	if (lineNumbers) {
		collector.addRule(`.monaco-editor .line-numbers { color: ${lineNumbers}; }`);
	}
});