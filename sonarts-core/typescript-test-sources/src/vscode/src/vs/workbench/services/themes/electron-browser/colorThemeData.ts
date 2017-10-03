/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Paths = require('vs/base/common/paths');
import Json = require('vs/base/common/json');
import { Color } from 'vs/base/common/color';
import { ExtensionData, ITokenColorizationRule, IColorTheme, IColorMap, IThemeExtensionPoint, VS_LIGHT_THEME, VS_HC_THEME } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { convertSettings } from 'vs/workbench/services/themes/electron-browser/themeCompatibility';
import { TPromise } from 'vs/base/common/winjs.base';
import nls = require('vs/nls');
import * as types from 'vs/base/common/types';
import * as objects from 'vs/base/common/objects';

import * as plist from 'fast-plist';
import pfs = require('vs/base/node/pfs');

import { Extensions, IColorRegistry, ColorIdentifier, editorBackground, editorForeground } from 'vs/platform/theme/common/colorRegistry';
import { ThemeType } from 'vs/platform/theme/common/themeService';
import { Registry } from 'vs/platform/platform';
import { WorkbenchThemeService, IColorCustomizations } from "vs/workbench/services/themes/electron-browser/workbenchThemeService";
import { getParseErrorMessage } from "vs/base/common/jsonErrorMessages";

let colorRegistry = <IColorRegistry>Registry.as(Extensions.ColorContribution);

export class ColorThemeData implements IColorTheme {

	constructor() {
	}

	id: string;
	label: string;
	settingsId: string;
	description?: string;
	tokenColors?: ITokenColorizationRule[];
	isLoaded: boolean;
	path?: string;
	extensionData: ExtensionData;
	colorMap: IColorMap = {};
	customColorMap: IColorMap = {};

	public getColor(colorId: ColorIdentifier, useDefault?: boolean): Color {
		let color = this.customColorMap[colorId];
		if (color) {
			return color;
		}
		color = this.colorMap[colorId];
		if (useDefault !== false && types.isUndefined(color)) {
			color = this.getDefault(colorId);
		}
		return color;
	}

	public getDefault(colorId: ColorIdentifier): Color {
		return colorRegistry.resolveDefaultColor(colorId, this);
	}

	public defines(colorId: ColorIdentifier): boolean {
		return this.customColorMap.hasOwnProperty(colorId) || this.colorMap.hasOwnProperty(colorId);
	}

	public setCustomColors(colors: IColorCustomizations) {
		this.customColorMap = {};
		for (let id in colors) {
			let colorVal = colors[id];
			if (typeof colorVal === 'string') {
				let color = Color.fromHex(colorVal, null);
				if (color) {
					this.customColorMap[id] = color;
				}
			}
		}
		if (this.tokenColors) {
			updateDefaultRuleSettings(this.tokenColors[0], this);
		}
	}

	public ensureLoaded(themeService: WorkbenchThemeService): TPromise<void> {
		if (!this.isLoaded) {
			this.tokenColors = [];
			this.colorMap = {};
			if (this.path) {
				return _loadColorThemeFromFile(this.path, this.tokenColors, this.colorMap).then(_ => {
					this.isLoaded = true;
					_sanitizeTokenColors(this);
				});
			}
		}
		return TPromise.as(null);
	}

	toThemeFile() {
		if (!this.isLoaded) {
			return '';
		}
		let content = { name: this.label, colors: {}, tokenColors: this.tokenColors };
		for (let key in this.colorMap) {
			content.colors[key] = this.colorMap[key].toRGBAHex(true);
		}
		return JSON.stringify(content, null, '\t');
	}

	toStorageData() {
		let colorMapData = {};
		for (let key in this.colorMap) {
			colorMapData[key] = this.colorMap[key].toRGBAHex(true);
		}
		return JSON.stringify({
			id: this.id,
			label: this.label,
			settingsId: this.settingsId,
			selector: this.id.split(' ').join('.'), // to not break old clients
			tokenColors: this.tokenColors,
			extensionData: this.extensionData,
			colorMap: colorMapData
		});
	}

	hasEqualData(other: ColorThemeData) {
		return objects.equals(this.colorMap, other.colorMap) && objects.equals(this.tokenColors, other.tokenColors);
	}

	get type(): ThemeType {
		let baseTheme = this.id.split(' ')[0];
		switch (baseTheme) {
			case VS_LIGHT_THEME: return 'light';
			case VS_HC_THEME: return 'hc';
			default: return 'dark';
		}
	}
}

export function fromStorageData(input: string): ColorThemeData {
	try {
		let data = JSON.parse(input);
		let theme = new ColorThemeData();
		for (let key in data) {
			if (key !== 'colorMap') {
				theme[key] = data[key];
			} else {
				let colorMapData = data[key];
				for (let id in colorMapData) {
					theme.colorMap[id] = Color.fromHex(colorMapData[id]);
				}
			}
		}
		return theme;
	} catch (e) {
		return null;
	}
}

export function fromExtensionTheme(theme: IThemeExtensionPoint, normalizedAbsolutePath: string, extensionData: ExtensionData): ColorThemeData {
	let baseTheme = theme['uiTheme'] || 'vs-dark';

	let themeSelector = toCSSSelector(extensionData.extensionId + '-' + Paths.normalize(theme.path));
	let themeData = new ColorThemeData();
	themeData.id = `${baseTheme} ${themeSelector}`;
	themeData.label = theme.label || Paths.basename(theme.path);
	themeData.settingsId = theme.id || themeData.label;
	themeData.description = theme.description;
	themeData.path = normalizedAbsolutePath;
	themeData.extensionData = extensionData;
	themeData.isLoaded = false;
	return themeData;
}

function toCSSSelector(str: string) {
	str = str.replace(/[^_\-a-zA-Z0-9]/g, '-');
	if (str.charAt(0).match(/[0-9\-]/)) {
		str = '_' + str;
	}
	return str;
}

function _loadColorThemeFromFile(themePath: string, resultRules: ITokenColorizationRule[], resultColors: IColorMap): TPromise<any> {
	if (Paths.extname(themePath) === '.json') {
		return pfs.readFile(themePath).then(content => {
			let errors: Json.ParseError[] = [];
			let contentValue = Json.parse(content.toString(), errors);
			if (errors.length > 0) {
				return TPromise.wrapError(new Error(nls.localize('error.cannotparsejson', "Problems parsing JSON theme file: {0}", errors.map(e => getParseErrorMessage(e.error)).join(', '))));
			}
			let includeCompletes = TPromise.as(null);
			if (contentValue.include) {
				includeCompletes = _loadColorThemeFromFile(Paths.join(Paths.dirname(themePath), contentValue.include), resultRules, resultColors);
			}
			return includeCompletes.then(_ => {
				if (Array.isArray(contentValue.settings)) {
					convertSettings(contentValue.settings, resultRules, resultColors);
					return null;
				}
				let colors = contentValue.colors;
				if (colors) {
					if (typeof colors !== 'object') {
						return TPromise.wrapError(new Error(nls.localize({ key: 'error.invalidformat.colors', comment: ['{0} will be replaced by a path. Values in quotes should not be translated.'] }, "Problem parsing color theme file: {0}. Property 'colors' is not of type 'object'.", themePath)));
					}
					// new JSON color themes format
					for (let colorId in colors) {
						let colorHex = Color.fromHex(colors[colorId], null);
						if (colorHex) { // ignore invalid colors
							resultColors[colorId] = colorHex;
						}
					}
				}
				let tokenColors = contentValue.tokenColors;
				if (tokenColors) {
					if (Array.isArray(tokenColors)) {
						resultRules.push(...tokenColors);
						return null;
					} else if (typeof tokenColors === 'string') {
						return _loadSyntaxTokensFromFile(Paths.join(Paths.dirname(themePath), tokenColors), resultRules, {});
					} else {
						return TPromise.wrapError(new Error(nls.localize({ key: 'error.invalidformat.tokenColors', comment: ['{0} will be replaced by a path. Values in quotes should not be translated.'] }, "Problem parsing color theme file: {0}. Property 'tokenColors' should be either an array specifying colors or a path to a text mate theme file", themePath)));
					}
				}
				return null;
			});
		});
	} else {
		return _loadSyntaxTokensFromFile(themePath, resultRules, resultColors);
	}
}

function _loadSyntaxTokensFromFile(themePath: string, resultRules: ITokenColorizationRule[], resultColors: IColorMap): TPromise<any> {
	return pfs.readFile(themePath).then(content => {
		try {
			let contentValue = plist.parse(content.toString());
			let settings: ITokenColorizationRule[] = contentValue.settings;
			if (!Array.isArray(settings)) {
				return TPromise.wrapError(new Error(nls.localize('error.plist.invalidformat', "Problem parsing tmTheme file: {0}. 'settings' is not array.")));
			}
			convertSettings(settings, resultRules, resultColors);
			return TPromise.as(null);
		} catch (e) {
			return TPromise.wrapError(new Error(nls.localize('error.cannotparse', "Problems parsing tmTheme file: {0}", e.message)));
		}
	}, error => {
		return TPromise.wrapError(new Error(nls.localize('error.cannotload', "Problems loading tmTheme file {0}: {1}", themePath, error.message)));
	});
}
/**
 * Place the default settings first and add add the token-info rules
 */
function _sanitizeTokenColors(theme: ColorThemeData) {
	let hasDefaultTokens = false;
	let updatedTokenColors: ITokenColorizationRule[] = [updateDefaultRuleSettings({ settings: {} }, theme)];
	theme.tokenColors.forEach(rule => {
		if (rule.scope) {
			if (rule.scope === 'token.info-token') {
				hasDefaultTokens = true;
			}
			updatedTokenColors.push(rule);
		}
	});
	if (!hasDefaultTokens) {
		updatedTokenColors.push(...defaultThemeColors[theme.type]);
	}
	theme.tokenColors = updatedTokenColors;
}

function updateDefaultRuleSettings(defaultRule: ITokenColorizationRule, theme: ColorThemeData): ITokenColorizationRule {
	let foreground = theme.getColor(editorForeground) || theme.getDefault(editorForeground);
	let background = theme.getColor(editorBackground) || theme.getDefault(editorBackground);
	defaultRule.settings.foreground = foreground.toRGBAHex();
	defaultRule.settings.background = background.toRGBAHex();
	return defaultRule;
}


let defaultThemeColors: { [baseTheme: string]: ITokenColorizationRule[] } = {
	'light': [
		{ scope: 'token.info-token', settings: { foreground: '#316bcd' } },
		{ scope: 'token.warn-token', settings: { foreground: '#cd9731' } },
		{ scope: 'token.error-token', settings: { foreground: '#cd3131' } },
		{ scope: 'token.debug-token', settings: { foreground: '#800080' } }
	],
	'dark': [
		{ scope: 'token.info-token', settings: { foreground: '#6796e6' } },
		{ scope: 'token.warn-token', settings: { foreground: '#cd9731' } },
		{ scope: 'token.error-token', settings: { foreground: '#f44747' } },
		{ scope: 'token.debug-token', settings: { foreground: '#b267e6' } }
	],
	'hc': [
		{ scope: 'token.info-token', settings: { foreground: '#6796e6' } },
		{ scope: 'token.warn-token', settings: { foreground: '#008000' } },
		{ scope: 'token.error-token', settings: { foreground: '#FF0000' } },
		{ scope: 'token.debug-token', settings: { foreground: '#b267e6' } }
	],
};