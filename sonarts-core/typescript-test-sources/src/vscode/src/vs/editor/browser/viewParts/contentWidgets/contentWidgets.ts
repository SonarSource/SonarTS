/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as dom from 'vs/base/browser/dom';
import { FastDomNode, createFastDomNode } from 'vs/base/browser/fastDomNode';
import { ContentWidgetPositionPreference, IContentWidget } from 'vs/editor/browser/editorBrowser';
import { ViewPart, PartFingerprint, PartFingerprints } from 'vs/editor/browser/view/viewPart';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/common/view/renderingContext';
import { Position, IPosition } from 'vs/editor/common/core/position';
import * as viewEvents from 'vs/editor/common/view/viewEvents';

class Coordinate {
	_coordinateBrand: void;

	public readonly top: number;
	public readonly left: number;

	constructor(top: number, left: number) {
		this.top = top;
		this.left = left;
	}
}

export class ViewContentWidgets extends ViewPart {

	private _viewDomNode: FastDomNode<HTMLElement>;
	private _widgets: { [key: string]: Widget; };

	public domNode: FastDomNode<HTMLElement>;
	public overflowingContentWidgetsDomNode: FastDomNode<HTMLElement>;

	constructor(context: ViewContext, viewDomNode: FastDomNode<HTMLElement>) {
		super(context);
		this._viewDomNode = viewDomNode;
		this._widgets = {};

		this.domNode = createFastDomNode(document.createElement('div'));
		PartFingerprints.write(this.domNode, PartFingerprint.ContentWidgets);
		this.domNode.setClassName('contentWidgets');
		this.domNode.setPosition('absolute');
		this.domNode.setTop(0);

		this.overflowingContentWidgetsDomNode = createFastDomNode(document.createElement('div'));
		PartFingerprints.write(this.overflowingContentWidgetsDomNode, PartFingerprint.OverflowingContentWidgets);
		this.overflowingContentWidgetsDomNode.setClassName('overflowingContentWidgets');
	}

	public dispose(): void {
		super.dispose();
		this._widgets = null;
		this.domNode = null;
	}

	// --- begin event handlers

	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		let keys = Object.keys(this._widgets);
		for (let i = 0, len = keys.length; i < len; i++) {
			const widgetId = keys[i];
			this._widgets[widgetId].onConfigurationChanged(e);
		}
		return true;
	}
	public onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean {
		// true for inline decorations that can end up relayouting text
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
		return true;
	}
	public onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean {
		return true;
	}

	// ---- end view event handlers

	public addWidget(_widget: IContentWidget): void {
		const myWidget = new Widget(this._context, this._viewDomNode, _widget);
		this._widgets[myWidget.id] = myWidget;

		if (myWidget.allowEditorOverflow) {
			this.overflowingContentWidgetsDomNode.appendChild(myWidget.domNode);
		} else {
			this.domNode.appendChild(myWidget.domNode);
		}

		this.setShouldRender();
	}

	public setWidgetPosition(widget: IContentWidget, position: IPosition, preference: ContentWidgetPositionPreference[]): void {
		const myWidget = this._widgets[widget.getId()];
		myWidget.setPosition(position, preference);

		this.setShouldRender();
	}

	public removeWidget(widget: IContentWidget): void {
		const widgetId = widget.getId();
		if (this._widgets.hasOwnProperty(widgetId)) {
			const myWidget = this._widgets[widgetId];
			delete this._widgets[widgetId];

			const domNode = myWidget.domNode.domNode;
			domNode.parentNode.removeChild(domNode);
			domNode.removeAttribute('monaco-visible-content-widget');

			this.setShouldRender();
		}
	}

	public shouldSuppressMouseDownOnWidget(widgetId: string): boolean {
		if (this._widgets.hasOwnProperty(widgetId)) {
			return this._widgets[widgetId].suppressMouseDown;
		}
		return false;
	}

	public prepareRender(ctx: RenderingContext): void {
		let keys = Object.keys(this._widgets);
		for (let i = 0, len = keys.length; i < len; i++) {
			const widgetId = keys[i];
			this._widgets[widgetId].prepareRender(ctx);
		}
	}

	public render(ctx: RestrictedRenderingContext): void {
		let keys = Object.keys(this._widgets);
		for (let i = 0, len = keys.length; i < len; i++) {
			const widgetId = keys[i];
			this._widgets[widgetId].render(ctx);
		}
	}
}

interface IBoxLayoutResult {
	aboveTop: number;
	fitsAbove: boolean;
	belowTop: number;
	fitsBelow: boolean;
	left: number;
}

class Widget {
	private readonly _context: ViewContext;
	private readonly _viewDomNode: FastDomNode<HTMLElement>;
	private readonly _actual: IContentWidget;

	public readonly domNode: FastDomNode<HTMLElement>;
	public readonly id: string;
	public readonly allowEditorOverflow: boolean;
	public readonly suppressMouseDown: boolean;

	private _fixedOverflowWidgets: boolean;
	private _contentWidth: number;
	private _contentLeft: number;
	private _lineHeight: number;

	private _position: IPosition;
	private _preference: ContentWidgetPositionPreference[];
	private _isVisible: boolean;
	private _renderData: Coordinate;

	constructor(context: ViewContext, viewDomNode: FastDomNode<HTMLElement>, actual: IContentWidget) {
		this._context = context;
		this._viewDomNode = viewDomNode;
		this._actual = actual;
		this.domNode = createFastDomNode(this._actual.getDomNode());

		this.id = this._actual.getId();
		this.allowEditorOverflow = this._actual.allowEditorOverflow || false;
		this.suppressMouseDown = this._actual.suppressMouseDown || false;

		this._fixedOverflowWidgets = this._context.configuration.editor.viewInfo.fixedOverflowWidgets;
		this._contentWidth = this._context.configuration.editor.layoutInfo.contentWidth;
		this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;
		this._lineHeight = this._context.configuration.editor.lineHeight;

		this._position = null;
		this._preference = null;
		this._isVisible = false;
		this._renderData = null;

		this.domNode.setPosition((this._fixedOverflowWidgets && this.allowEditorOverflow) ? 'fixed' : 'absolute');
		this._updateMaxWidth();
		this.domNode.setVisibility('hidden');
		this.domNode.setAttribute('widgetId', this.id);
	}

	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): void {
		if (e.lineHeight) {
			this._lineHeight = this._context.configuration.editor.lineHeight;
		}
		if (e.layoutInfo) {
			this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;
			this._contentWidth = this._context.configuration.editor.layoutInfo.contentWidth;

			this._updateMaxWidth();
		}
	}

	private _updateMaxWidth(): void {
		const maxWidth = this.allowEditorOverflow
			? window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
			: this._contentWidth;

		this.domNode.setMaxWidth(maxWidth);
	}

	public setPosition(position: IPosition, preference: ContentWidgetPositionPreference[]): void {
		this._position = position;
		this._preference = preference;
	}

	private _layoutBoxInViewport(topLeft: Coordinate, width: number, height: number, ctx: RenderingContext): IBoxLayoutResult {
		// Our visible box is split horizontally by the current line => 2 boxes

		// a) the box above the line
		let aboveLineTop = topLeft.top;
		let heightAboveLine = aboveLineTop;

		// b) the box under the line
		let underLineTop = topLeft.top + this._lineHeight;
		let heightUnderLine = ctx.viewportHeight - underLineTop;

		let aboveTop = aboveLineTop - height;
		let fitsAbove = (heightAboveLine >= height);
		let belowTop = underLineTop;
		let fitsBelow = (heightUnderLine >= height);

		// And its left
		let actualLeft = topLeft.left;
		if (actualLeft + width > ctx.scrollLeft + ctx.viewportWidth) {
			actualLeft = ctx.scrollLeft + ctx.viewportWidth - width;
		}
		if (actualLeft < ctx.scrollLeft) {
			actualLeft = ctx.scrollLeft;
		}

		return {
			aboveTop: aboveTop,
			fitsAbove: fitsAbove,
			belowTop: belowTop,
			fitsBelow: fitsBelow,
			left: actualLeft
		};
	}

	private _layoutBoxInPage(topLeft: Coordinate, width: number, height: number, ctx: RenderingContext): IBoxLayoutResult {
		let left0 = topLeft.left - ctx.scrollLeft;

		if (left0 + width < 0 || left0 > this._contentWidth) {
			return null;
		}

		let aboveTop = topLeft.top - height;
		let belowTop = topLeft.top + this._lineHeight;
		let left = left0 + this._contentLeft;

		let domNodePosition = dom.getDomNodePagePosition(this._viewDomNode.domNode);
		let absoluteAboveTop = domNodePosition.top + aboveTop - dom.StandardWindow.scrollY;
		let absoluteBelowTop = domNodePosition.top + belowTop - dom.StandardWindow.scrollY;
		let absoluteLeft = domNodePosition.left + left - dom.StandardWindow.scrollX;

		let INNER_WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		let INNER_HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		// Leave some clearance to the bottom
		let TOP_PADDING = 22;
		let BOTTOM_PADDING = 22;

		let fitsAbove = (absoluteAboveTop >= TOP_PADDING),
			fitsBelow = (absoluteBelowTop + height <= INNER_HEIGHT - BOTTOM_PADDING);

		if (absoluteLeft + width + 20 > INNER_WIDTH) {
			let delta = absoluteLeft - (INNER_WIDTH - width - 20);
			absoluteLeft -= delta;
			left -= delta;
		}
		if (absoluteLeft < 0) {
			let delta = absoluteLeft;
			absoluteLeft -= delta;
			left -= delta;
		}

		if (this._fixedOverflowWidgets) {
			aboveTop = absoluteAboveTop;
			belowTop = absoluteBelowTop;
			left = absoluteLeft;
		}

		return { aboveTop, fitsAbove, belowTop, fitsBelow, left };
	}

	private _prepareRenderWidgetAtExactPositionOverflowing(topLeft: Coordinate): Coordinate {
		return new Coordinate(topLeft.top, topLeft.left + this._contentLeft);
	}

	private _getTopLeft(ctx: RenderingContext, position: Position): Coordinate {
		const visibleRange = ctx.visibleRangeForPosition(position);
		if (!visibleRange) {
			return null;
		}

		const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.scrollTop;
		return new Coordinate(top, visibleRange.left);
	}

	private _prepareRenderWidget(ctx: RenderingContext): Coordinate {
		if (!this._position || !this._preference) {
			return null;
		}

		// Do not trust that widgets have a valid position
		let validModelPosition = this._context.model.validateModelPosition(this._position);

		if (!this._context.model.coordinatesConverter.modelPositionIsVisible(validModelPosition)) {
			// this position is hidden by the view model
			return null;
		}

		let position = this._context.model.coordinatesConverter.convertModelPositionToViewPosition(validModelPosition);

		let placement: IBoxLayoutResult = null;
		let fetchPlacement = () => {
			if (placement) {
				return;
			}

			const topLeft = this._getTopLeft(ctx, position);
			if (!topLeft) {
				return null;
			}

			const domNode = this.domNode.domNode;
			const width = domNode.clientWidth;
			const height = domNode.clientHeight;

			if (this.allowEditorOverflow) {
				placement = this._layoutBoxInPage(topLeft, width, height, ctx);
			} else {
				placement = this._layoutBoxInViewport(topLeft, width, height, ctx);
			}
		};

		// Do two passes, first for perfect fit, second picks first option
		for (let pass = 1; pass <= 2; pass++) {
			for (let i = 0; i < this._preference.length; i++) {
				let pref = this._preference[i];
				if (pref === ContentWidgetPositionPreference.ABOVE) {
					fetchPlacement();
					if (!placement) {
						// Widget outside of viewport
						return null;
					}
					if (pass === 2 || placement.fitsAbove) {
						return new Coordinate(placement.aboveTop, placement.left);
					}
				} else if (pref === ContentWidgetPositionPreference.BELOW) {
					fetchPlacement();
					if (!placement) {
						// Widget outside of viewport
						return null;
					}
					if (pass === 2 || placement.fitsBelow) {
						return new Coordinate(placement.belowTop, placement.left);
					}
				} else {
					const topLeft = this._getTopLeft(ctx, position);
					if (!topLeft) {
						// Widget outside of viewport
						return null;
					}
					if (this.allowEditorOverflow) {
						return this._prepareRenderWidgetAtExactPositionOverflowing(topLeft);
					} else {
						return topLeft;
					}
				}
			}
		}
		return null;
	}

	public prepareRender(ctx: RenderingContext): void {
		this._renderData = this._prepareRenderWidget(ctx);
	}

	public render(ctx: RestrictedRenderingContext): void {
		if (!this._renderData) {
			// This widget should be invisible
			if (this._isVisible) {
				this.domNode.removeAttribute('monaco-visible-content-widget');
				this._isVisible = false;
				this.domNode.setVisibility('hidden');
			}
			return;
		}

		// This widget should be visible
		if (this.allowEditorOverflow) {
			this.domNode.setTop(this._renderData.top);
			this.domNode.setLeft(this._renderData.left);
		} else {
			this.domNode.setTop(this._renderData.top + ctx.scrollTop - ctx.bigNumbersDelta);
			this.domNode.setLeft(this._renderData.left);
		}

		if (!this._isVisible) {
			this.domNode.setVisibility('inherit');
			this.domNode.setAttribute('monaco-visible-content-widget', 'true');
			this._isVisible = true;
		}
	}
}
