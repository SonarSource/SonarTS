/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import nls = require('vs/nls');

import { Registry } from 'vs/platform/platform';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { IJSONSchema } from 'vs/base/common/jsonSchema';

import { Extensions as ThemeingExtensions, IColorRegistry } from 'vs/platform/theme/common/colorRegistry';

let themingRegistry = <IColorRegistry>Registry.as(ThemeingExtensions.ColorContribution);
let textMateScopes = [
	'comment',
	'comment.block',
	'comment.block.documentation',
	'comment.line',
	'constant',
	'constant.character',
	'constant.character.escape',
	'constant.numeric',
	'constant.numeric.integer',
	'constant.numeric.float',
	'constant.numeric.hex',
	'constant.numeric.octal',
	'constant.other',
	'constant.regexp',
	'constant.rgb-value',
	'emphasis',
	'entity',
	'entity.name',
	'entity.name.class',
	'entity.name.function',
	'entity.name.method',
	'entity.name.section',
	'entity.name.selector',
	'entity.name.tag',
	'entity.name.type',
	'entity.other',
	'entity.other.attribute-name',
	'entity.other.inherited-class',
	'invalid',
	'invalid.deprecated',
	'invalid.illegal',
	'keyword',
	'keyword.control',
	'keyword.operator',
	'keyword.operator.new',
	'keyword.operator.assignment',
	'keyword.operator.arithmetic',
	'keyword.operator.logical',
	'keyword.other',
	'markup',
	'markup.bold',
	'markup.changed',
	'markup.deleted',
	'markup.heading',
	'markup.inline.raw',
	'markup.inserted',
	'markup.italic',
	'markup.list',
	'markup.list.numbered',
	'markup.list.unnumbered',
	'markup.other',
	'markup.quote',
	'markup.raw',
	'markup.underline',
	'markup.underline.link',
	'meta',
	'meta.block',
	'meta.cast',
	'meta.class',
	'meta.function',
	'meta.function-call',
	'meta.preprocessor',
	'meta.return-type',
	'meta.selector',
	'meta.tag',
	'meta.type.annotation',
	'meta.type',
	'punctuation.definition.string.begin',
	'punctuation.definition.string.end',
	'punctuation.separator',
	'punctuation.separator.continuation',
	'punctuation.terminator',
	'storage',
	'storage.modifier',
	'storage.type',
	'string',
	'string.interpolated',
	'string.other',
	'string.quoted',
	'string.quoted.double',
	'string.quoted.other',
	'string.quoted.single',
	'string.quoted.triple',
	'string.regexp',
	'string.unquoted',
	'strong',
	'support',
	'support.class',
	'support.constant',
	'support.function',
	'support.other',
	'support.type',
	'support.type.property-name',
	'support.variable',
	'variable',
	'variable.language',
	'variable.name',
	'variable.other',
	'variable.other.readwrite',
	'variable.parameter'
];

export const colorsSchema = themingRegistry.getColorSchema();
export const tokenColorsSchema = {
	type: 'array',
	description: nls.localize('schema.colors', 'Colors for syntax highlighting'),
	items: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description: nls.localize('schema.properties.name', 'Description of the rule')
			},
			scope: {
				anyOf: [
					{
						enum: textMateScopes
					},
					{
						type: 'string'
					},
					{
						type: 'array',
						items: {
							enum: textMateScopes
						}
					},
					{
						type: 'array',
						items: {
							type: 'string'
						}
					}
				]
			},
			settings: {
				type: 'object',
				properties: {
					foreground: {
						type: 'string',
						format: 'color'
					},
					background: {
						type: 'string',
						format: 'color'
					},
					fontStyle: {
						type: 'string',
						description: nls.localize('schema.fontStyle', 'Font style of the rule: One or a combination of \'italic\', \'bold\' and \'underline\'')
					}
				}
			}
		}
	}
};

const schemaId = 'vscode://schemas/color-theme';
const schema: IJSONSchema = {
	type: 'object',
	properties: {
		colors: colorsSchema,
		tokenColors: {
			anyOf: [{
				type: 'string',
				description: nls.localize('schema.tokenColors.path', 'Path to a tmTheme file (relative to the current file)')
			},
				tokenColorsSchema
			]
		}
	}
};

export function register() {
	let schemaRegistry = <IJSONContributionRegistry>Registry.as(JSONExtensions.JSONContribution);
	schemaRegistry.registerSchema(schemaId, schema);
}

