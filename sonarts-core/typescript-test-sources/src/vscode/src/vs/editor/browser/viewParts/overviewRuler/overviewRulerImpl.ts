/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { FastDomNode, createFastDomNode } from 'vs/base/browser/fastDomNode';
import { OverviewRulerLane } from 'vs/editor/common/editorCommon';
import { OverviewZoneManager, ColorZone, OverviewRulerZone } from 'vs/editor/common/view/overviewZoneManager';
import { Color } from 'vs/base/common/color';
import { OverviewRulerPosition } from 'vs/editor/common/config/editorOptions';
import { ThemeType, LIGHT } from 'vs/platform/theme/common/themeService';

export class OverviewRulerImpl {

	private _canvasLeftOffset: number;
	private _domNode: FastDomNode<HTMLCanvasElement>;
	private _lanesCount: number;
	private _zoneManager: OverviewZoneManager;
	private _canUseTranslate3d: boolean;
	private _background: Color;

	constructor(
		canvasLeftOffset: number, cssClassName: string, scrollHeight: number, lineHeight: number,
		canUseTranslate3d: boolean, pixelRatio: number, minimumHeight: number, maximumHeight: number,
		getVerticalOffsetForLine: (lineNumber: number) => number
	) {
		this._canvasLeftOffset = canvasLeftOffset;

		this._domNode = createFastDomNode(document.createElement('canvas'));

		this._domNode.setClassName(cssClassName);
		this._domNode.setPosition('absolute');

		this._lanesCount = 3;

		this._canUseTranslate3d = canUseTranslate3d;
		this._background = null;

		this._zoneManager = new OverviewZoneManager(getVerticalOffsetForLine);
		this._zoneManager.setMinimumHeight(minimumHeight);
		this._zoneManager.setMaximumHeight(maximumHeight);
		this._zoneManager.setThemeType(LIGHT);
		this._zoneManager.setDOMWidth(0);
		this._zoneManager.setDOMHeight(0);
		this._zoneManager.setOuterHeight(scrollHeight);
		this._zoneManager.setLineHeight(lineHeight);

		this._zoneManager.setPixelRatio(pixelRatio);
	}

	public dispose(): void {
		this._zoneManager = null;
	}

	public setLayout(position: OverviewRulerPosition, render: boolean): void {
		this._domNode.setTop(position.top);
		this._domNode.setRight(position.right);

		let hasChanged = false;
		hasChanged = this._zoneManager.setDOMWidth(position.width) || hasChanged;
		hasChanged = this._zoneManager.setDOMHeight(position.height) || hasChanged;

		if (hasChanged) {
			this._domNode.setWidth(this._zoneManager.getDOMWidth());
			this._domNode.setHeight(this._zoneManager.getDOMHeight());
			this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
			this._domNode.domNode.height = this._zoneManager.getCanvasHeight();

			if (render) {
				this.render(true);
			}
		}
	}

	public getLanesCount(): number {
		return this._lanesCount;
	}

	public setLanesCount(newLanesCount: number, render: boolean): void {
		this._lanesCount = newLanesCount;

		if (render) {
			this.render(true);
		}
	}

	public setThemeType(themeType: ThemeType, render: boolean): void {
		this._zoneManager.setThemeType(themeType);

		if (render) {
			this.render(true);
		}
	}

	public setUseBackground(background: Color, render: boolean): void {
		this._background = background;

		if (render) {
			this.render(true);
		}
	}

	public getDomNode(): HTMLCanvasElement {
		return this._domNode.domNode;
	}

	public getPixelWidth(): number {
		return this._zoneManager.getCanvasWidth();
	}

	public getPixelHeight(): number {
		return this._zoneManager.getCanvasHeight();
	}

	public setScrollHeight(scrollHeight: number, render: boolean): void {
		this._zoneManager.setOuterHeight(scrollHeight);
		if (render) {
			this.render(true);
		}
	}

	public setLineHeight(lineHeight: number, render: boolean): void {
		this._zoneManager.setLineHeight(lineHeight);
		if (render) {
			this.render(true);
		}
	}

	public setCanUseTranslate3d(canUseTranslate3d: boolean, render: boolean): void {
		this._canUseTranslate3d = canUseTranslate3d;
		if (render) {
			this.render(true);
		}
	}

	public setPixelRatio(pixelRatio: number, render: boolean): void {
		this._zoneManager.setPixelRatio(pixelRatio);
		this._domNode.setWidth(this._zoneManager.getDOMWidth());
		this._domNode.setHeight(this._zoneManager.getDOMHeight());
		this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
		this._domNode.domNode.height = this._zoneManager.getCanvasHeight();
		if (render) {
			this.render(true);
		}
	}

	public setZones(zones: OverviewRulerZone[], render: boolean): void {
		this._zoneManager.setZones(zones);
		if (render) {
			this.render(false);
		}
	}

	public render(forceRender: boolean): boolean {
		if (this._zoneManager.getOuterHeight() === 0) {
			return false;
		}
		if (this._canUseTranslate3d) {
			this._domNode.setTransform('translate3d(0px, 0px, 0px)');
		} else {
			this._domNode.setTransform('');
		}

		const width = this._zoneManager.getCanvasWidth();
		const height = this._zoneManager.getCanvasHeight();

		let colorZones = this._zoneManager.resolveColorZones();
		let id2Color = this._zoneManager.getId2Color();

		let ctx = this._domNode.domNode.getContext('2d');
		if (this._background === null) {
			ctx.clearRect(0, 0, width, height);
		} else {
			ctx.fillStyle = this._background.toRGBHex();
			ctx.fillRect(0, 0, width, height);
		}

		if (colorZones.length > 0) {
			let remainingWidth = width - this._canvasLeftOffset;

			if (this._lanesCount >= 3) {
				this._renderThreeLanes(ctx, colorZones, id2Color, remainingWidth);
			} else if (this._lanesCount === 2) {
				this._renderTwoLanes(ctx, colorZones, id2Color, remainingWidth);
			} else if (this._lanesCount === 1) {
				this._renderOneLane(ctx, colorZones, id2Color, remainingWidth);
			}
		}

		return true;
	}

	private _renderOneLane(ctx: CanvasRenderingContext2D, colorZones: ColorZone[], id2Color: string[], w: number): void {

		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Left | OverviewRulerLane.Center | OverviewRulerLane.Right, this._canvasLeftOffset, w);

	}

	private _renderTwoLanes(ctx: CanvasRenderingContext2D, colorZones: ColorZone[], id2Color: string[], w: number): void {

		let leftWidth = Math.floor(w / 2);
		let rightWidth = w - leftWidth;
		let leftOffset = this._canvasLeftOffset;
		let rightOffset = this._canvasLeftOffset + leftWidth;

		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Left | OverviewRulerLane.Center, leftOffset, leftWidth);
		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Right, rightOffset, rightWidth);
	}

	private _renderThreeLanes(ctx: CanvasRenderingContext2D, colorZones: ColorZone[], id2Color: string[], w: number): void {

		let leftWidth = Math.floor(w / 3);
		let rightWidth = Math.floor(w / 3);
		let centerWidth = w - leftWidth - rightWidth;
		let leftOffset = this._canvasLeftOffset;
		let centerOffset = this._canvasLeftOffset + leftWidth;
		let rightOffset = this._canvasLeftOffset + leftWidth + centerWidth;

		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Left, leftOffset, leftWidth);
		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Center, centerOffset, centerWidth);
		this._renderVerticalPatch(ctx, colorZones, id2Color, OverviewRulerLane.Right, rightOffset, rightWidth);
	}

	private _renderVerticalPatch(ctx: CanvasRenderingContext2D, colorZones: ColorZone[], id2Color: string[], laneMask: number, xpos: number, width: number): void {

		let currentColorId = 0;
		let currentFrom = 0;
		let currentTo = 0;

		for (let i = 0, len = colorZones.length; i < len; i++) {
			let zone = colorZones[i];

			if (!(zone.position & laneMask)) {
				continue;
			}

			let zoneColorId = zone.colorId;
			let zoneFrom = zone.from;
			let zoneTo = zone.to;

			if (zoneColorId !== currentColorId) {
				ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);

				currentColorId = zoneColorId;
				ctx.fillStyle = id2Color[currentColorId];
				currentFrom = zoneFrom;
				currentTo = zoneTo;
			} else {
				if (currentTo >= zoneFrom) {
					currentTo = Math.max(currentTo, zoneTo);
				} else {
					ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);
					currentFrom = zoneFrom;
					currentTo = zoneTo;
				}
			}
		}

		ctx.fillRect(xpos, currentFrom, width, currentTo - currentFrom);

	}
}
