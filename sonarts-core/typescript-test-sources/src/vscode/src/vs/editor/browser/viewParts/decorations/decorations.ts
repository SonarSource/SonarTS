/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./decorations';
import { DynamicViewOverlay } from 'vs/editor/browser/view/dynamicViewOverlay';
import { Range } from 'vs/editor/common/core/range';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import { RenderingContext, HorizontalRange } from 'vs/editor/common/view/renderingContext';
import { ViewModelDecoration } from 'vs/editor/common/viewModel/viewModel';
import * as viewEvents from 'vs/editor/common/view/viewEvents';

export class DecorationsOverlay extends DynamicViewOverlay {

	private _context: ViewContext;
	private _lineHeight: number;
	private _typicalHalfwidthCharacterWidth: number;
	private _renderResult: string[];

	constructor(context: ViewContext) {
		super();
		this._context = context;
		this._lineHeight = this._context.configuration.editor.lineHeight;
		this._typicalHalfwidthCharacterWidth = this._context.configuration.editor.fontInfo.typicalHalfwidthCharacterWidth;
		this._renderResult = null;

		this._context.addEventHandler(this);
	}

	public dispose(): void {
		this._context.removeEventHandler(this);
		this._context = null;
		this._renderResult = null;
		super.dispose();
	}

	// --- begin event handlers

	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		if (e.lineHeight) {
			this._lineHeight = this._context.configuration.editor.lineHeight;
		}
		if (e.fontInfo) {
			this._typicalHalfwidthCharacterWidth = this._context.configuration.editor.fontInfo.typicalHalfwidthCharacterWidth;
		}
		return true;
	}
	public onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean {
		return true;
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
		return e.scrollTopChanged || e.scrollWidthChanged;
	}
	public onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean {
		return true;
	}
	// --- end event handlers

	public prepareRender(ctx: RenderingContext): void {
		let _decorations = ctx.getDecorationsInViewport();

		// Keep only decorations with `className`
		let decorations: ViewModelDecoration[] = [], decorationsLen = 0;
		for (let i = 0, len = _decorations.length; i < len; i++) {
			let d = _decorations[i];
			if (d.source.options.className) {
				decorations[decorationsLen++] = d;
			}
		}

		// Sort decorations for consistent render output
		decorations = decorations.sort((a, b) => {
			let aClassName = a.source.options.className;
			let bClassName = b.source.options.className;

			if (aClassName < bClassName) {
				return -1;
			}
			if (aClassName > bClassName) {
				return 1;
			}

			return Range.compareRangesUsingStarts(a.range, b.range);
		});

		let visibleStartLineNumber = ctx.visibleRange.startLineNumber;
		let visibleEndLineNumber = ctx.visibleRange.endLineNumber;
		let output: string[] = [];
		for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
			let lineIndex = lineNumber - visibleStartLineNumber;
			output[lineIndex] = '';
		}

		// Render first whole line decorations and then regular decorations
		this._renderWholeLineDecorations(ctx, decorations, output);
		this._renderNormalDecorations(ctx, decorations, output);
		this._renderResult = output;
	}

	private _renderWholeLineDecorations(ctx: RenderingContext, decorations: ViewModelDecoration[], output: string[]): void {
		let lineHeight = String(this._lineHeight);
		let visibleStartLineNumber = ctx.visibleRange.startLineNumber;
		let visibleEndLineNumber = ctx.visibleRange.endLineNumber;

		for (let i = 0, lenI = decorations.length; i < lenI; i++) {
			let d = decorations[i];

			if (!d.source.options.isWholeLine) {
				continue;
			}

			let decorationOutput = (
				'<div class="cdr '
				+ d.source.options.className
				+ '" style="left:0;width:100%;height:'
				+ lineHeight
				+ 'px;"></div>'
			);

			let startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
			let endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
			for (let j = startLineNumber; j <= endLineNumber; j++) {
				let lineIndex = j - visibleStartLineNumber;
				output[lineIndex] += decorationOutput;
			}
		}
	}

	private _renderNormalDecorations(ctx: RenderingContext, decorations: ViewModelDecoration[], output: string[]): void {
		let lineHeight = String(this._lineHeight);
		let visibleStartLineNumber = ctx.visibleRange.startLineNumber;

		for (let i = 0, lenI = decorations.length; i < lenI; i++) {
			let d = decorations[i];

			if (d.source.options.isWholeLine) {
				continue;
			}

			let className = d.source.options.className;

			let linesVisibleRanges = ctx.linesVisibleRangesForRange(d.range, /*TODO@Alex*/className === 'findMatch');
			if (!linesVisibleRanges) {
				continue;
			}

			for (let j = 0, lenJ = linesVisibleRanges.length; j < lenJ; j++) {
				let lineVisibleRanges = linesVisibleRanges[j];
				let lineIndex = lineVisibleRanges.lineNumber - visibleStartLineNumber;

				if (lineVisibleRanges.ranges.length === 1) {
					const singleVisibleRange = lineVisibleRanges.ranges[0];
					if (singleVisibleRange.width === 0) {
						// collapsed range case => make the decoration visible by faking its width
						lineVisibleRanges.ranges[0] = new HorizontalRange(singleVisibleRange.left, this._typicalHalfwidthCharacterWidth);
					}
				}

				for (let k = 0, lenK = lineVisibleRanges.ranges.length; k < lenK; k++) {
					let visibleRange = lineVisibleRanges.ranges[k];
					let decorationOutput = (
						'<div class="cdr '
						+ className
						+ '" style="left:'
						+ String(visibleRange.left)
						+ 'px;width:'
						+ String(visibleRange.width)
						+ 'px;height:'
						+ lineHeight
						+ 'px;"></div>'
					);
					output[lineIndex] += decorationOutput;
				}
			}
		}
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
