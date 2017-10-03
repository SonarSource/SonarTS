/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import nls = require('vs/nls');

import { registerColor, ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';

/**
 * The color identifiers for the terminal's ansi colors. The index in the array corresponds to the index
 * of the color in the terminal color table.
 */
export const ansiColorIdentifiers: ColorIdentifier[] = [];

export const TERMINAL_BACKGROUND_COLOR = registerColor('terminal.background', null, nls.localize('terminal.background', 'The background color of the terminal, this allows coloring the terminal differently to the panel.'));
export const TERMINAL_FOREGROUND_COLOR = registerColor('terminal.foreground', null, nls.localize('terminal.foreground', 'The foreground color of the terminal.'));

const ansiColorMap = {
	'terminal.ansiBlack': {
		index: 0,
		defaults: {
			light: '#000000',
			dark: '#000000',
			hc: '#000000'
		}
	},
	'terminal.ansiRed': {
		index: 1,
		defaults: {
			light: '#cd3131',
			dark: '#cd3131',
			hc: '#cd0000'
		}
	},
	'terminal.ansiGreen': {
		index: 2,
		defaults: {
			light: '#00BC00',
			dark: '#0DBC79',
			hc: '#00cd00'
		}
	},
	'terminal.ansiYellow': {
		index: 3,
		defaults: {
			light: '#949800',
			dark: '#e5e510',
			hc: '#cdcd00'
		}
	},
	'terminal.ansiBlue': {
		index: 4,
		defaults: {
			light: '#0451a5',
			dark: '#2472c8',
			hc: '#0000ee'
		}
	},
	'terminal.ansiMagenta': {
		index: 5,
		defaults: {
			light: '#bc05bc',
			dark: '#bc3fbc',
			hc: '#cd00cd'
		}
	},
	'terminal.ansiCyan': {
		index: 6,
		defaults: {
			light: '#0598bc',
			dark: '#11a8cd',
			hc: '#00cdcd'
		}
	},
	'terminal.ansiWhite': {
		index: 7,
		defaults: {
			light: '#555555',
			dark: '#e5e5e5',
			hc: '#e5e5e5'
		}
	},
	'terminal.ansiBrightBlack': {
		index: 8,
		defaults: {
			light: '#666666',
			dark: '#666666',
			hc: '#7f7f7f'
		}
	},
	'terminal.ansiBrightRed': {
		index: 9,
		defaults: {
			light: '#cd3131',
			dark: '#f14c4c',
			hc: '#ff0000'
		}
	},
	'terminal.ansiBrightGreen': {
		index: 10,
		defaults: {
			light: '#14CE14',
			dark: '#23d18b',
			hc: '#00ff00'
		}
	},
	'terminal.ansiBrightYellow': {
		index: 11,
		defaults: {
			light: '#b5ba00',
			dark: '#f5f543',
			hc: '#ffff00'
		}
	},
	'terminal.ansiBrightBlue': {
		index: 12,
		defaults: {
			light: '#0451a5',
			dark: '#3b8eea',
			hc: '#5c5cff'
		}
	},
	'terminal.ansiBrightMagenta': {
		index: 13,
		defaults: {
			light: '#bc05bc',
			dark: '#d670d6',
			hc: '#ff00ff'
		}
	},
	'terminal.ansiBrightCyan': {
		index: 14,
		defaults: {
			light: '#0598bc',
			dark: '#29b8db',
			hc: '#00ffff'
		}
	},
	'terminal.ansiBrightWhite': {
		index: 15,
		defaults: {
			light: '#a5a5a5',
			dark: '#e5e5e5',
			hc: '#ffffff'
		}
	}
};

export function registerColors(): void {
	for (let id in ansiColorMap) {
		let entry = ansiColorMap[id];
		let colorName = id.substring(13);
		ansiColorIdentifiers[entry.index] = registerColor(id, entry.defaults, nls.localize('terminal.ansiColor', '\'{0}\' ansi color in the terminal.', colorName));
	}

}
