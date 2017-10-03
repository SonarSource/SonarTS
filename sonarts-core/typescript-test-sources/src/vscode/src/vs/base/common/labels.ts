/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from 'vs/base/common/uri';
import platform = require('vs/base/common/platform');
import types = require('vs/base/common/types');
import { nativeSep, normalize } from 'vs/base/common/paths';
import { endsWith, ltrim } from 'vs/base/common/strings';
import { isEqualOrParent, isEqual } from 'vs/platform/files/common/files';

export interface ILabelProvider {

	/**
	 * Given an element returns a label for it to display in the UI.
	 */
	getLabel(element: any): string;
}

export interface IWorkspaceProvider {
	getWorkspace(): {
		resource: URI;
	};
}

export interface IUserHomeProvider {
	userHome: string;
}

export class PathLabelProvider implements ILabelProvider {
	private root: string;

	constructor(arg1?: URI | string | IWorkspaceProvider) {
		this.root = arg1 && getPath(arg1);
	}

	public getLabel(arg1: URI | string | IWorkspaceProvider): string {
		return getPathLabel(getPath(arg1), this.root);
	}
}

export function getPathLabel(resource: URI | string, basePathProvider?: URI | string | IWorkspaceProvider, userHomeProvider?: IUserHomeProvider): string {
	const absolutePath = getPath(resource);
	if (!absolutePath) {
		return null;
	}

	const basepath = basePathProvider && getPath(basePathProvider);

	if (basepath && isEqualOrParent(absolutePath, basepath, !platform.isLinux /* ignorecase */)) {
		if (isEqual(basepath, absolutePath, !platform.isLinux /* ignorecase */)) {
			return ''; // no label if pathes are identical
		}

		return normalize(ltrim(absolutePath.substr(basepath.length), nativeSep), true);
	}

	if (platform.isWindows && absolutePath && absolutePath[1] === ':') {
		return normalize(absolutePath.charAt(0).toUpperCase() + absolutePath.slice(1), true); // convert c:\something => C:\something
	}

	let res = normalize(absolutePath, true);
	if (!platform.isWindows && userHomeProvider) {
		res = tildify(res, userHomeProvider.userHome);
	}

	return res;
}

function getPath(arg1: URI | string | IWorkspaceProvider): string {
	if (!arg1) {
		return null;
	}

	if (typeof arg1 === 'string') {
		return arg1;
	}

	if (types.isFunction((<IWorkspaceProvider>arg1).getWorkspace)) {
		const ws = (<IWorkspaceProvider>arg1).getWorkspace();
		return ws ? ws.resource.fsPath : void 0;
	}

	return (<URI>arg1).fsPath;
}

export function tildify(path: string, userHome: string): string {
	if (path && (platform.isMacintosh || platform.isLinux) && isEqualOrParent(path, userHome, !platform.isLinux /* ignorecase */)) {
		path = `~${path.substr(userHome.length)}`;
	}

	return path;
}

/**
 * Shortens the paths but keeps them easy to distinguish.
 * Replaces not important parts with ellipsis.
 * Every shorten path matches only one original path and vice versa.
 *
 * Algorithm for shortening paths is as follows:
 * 1. For every path in list, find unique substring of that path.
 * 2. Unique substring along with ellipsis is shortened path of that path.
 * 3. To find unique substring of path, consider every segment of length from 1 to path.length of path from end of string
 *    and if present segment is not substring to any other paths then present segment is unique path,
 *    else check if it is not present as suffix of any other path and present segment is suffix of path itself,
 *    if it is true take present segment as unique path.
 * 4. Apply ellipsis to unique segment according to whether segment is present at start/in-between/end of path.
 *
 * Example 1
 * 1. consider 2 paths i.e. ['a\\b\\c\\d', 'a\\f\\b\\c\\d']
 * 2. find unique path of first path,
 * 	a. 'd' is present in path2 and is suffix of path2, hence not unique of present path.
 * 	b. 'c' is present in path2 and 'c' is not suffix of present path, similarly for 'b' and 'a' also.
 * 	c. 'd\\c' is suffix of path2.
 *  d. 'b\\c' is not suffix of present path.
 *  e. 'a\\b' is not present in path2, hence unique path is 'a\\b...'.
 * 3. for path2, 'f' is not present in path1 hence unique is '...\\f\\...'.
 *
 * Example 2
 * 1. consider 2 paths i.e. ['a\\b', 'a\\b\\c'].
 * 	a. Even if 'b' is present in path2, as 'b' is suffix of path1 and is not suffix of path2, unique path will be '...\\b'.
 * 2. for path2, 'c' is not present in path1 hence unique path is '..\\c'.
 */
const ellipsis = '\u2026';
const unc = '\\\\';
export function shorten(paths: string[]): string[] {
	const shortenedPaths: string[] = new Array(paths.length);

	// for every path
	let match = false;
	for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
		let path = paths[pathIndex];

		if (path === '') {
			shortenedPaths[pathIndex] = '.';
			continue;
		}

		if (!path) {
			shortenedPaths[pathIndex] = path;
			continue;
		}

		match = true;

		// trim for now and concatenate unc path (e.g. \\network) or root path (/etc) later
		let prefix = '';
		if (path.indexOf(unc) === 0) {
			prefix = path.substr(0, path.indexOf(unc) + unc.length);
			path = path.substr(path.indexOf(unc) + unc.length);
		} else if (path.indexOf(nativeSep) === 0) {
			prefix = path.substr(0, path.indexOf(nativeSep) + nativeSep.length);
			path = path.substr(path.indexOf(nativeSep) + nativeSep.length);
		}

		// pick the first shortest subpath found
		const segments: string[] = path.split(nativeSep);
		for (let subpathLength = 1; match && subpathLength <= segments.length; subpathLength++) {
			for (let start = segments.length - subpathLength; match && start >= 0; start--) {
				match = false;
				let subpath = segments.slice(start, start + subpathLength).join(nativeSep);

				// that is unique to any other path
				for (let otherPathIndex = 0; !match && otherPathIndex < paths.length; otherPathIndex++) {

					// suffix subpath treated specially as we consider no match 'x' and 'x/...'
					if (otherPathIndex !== pathIndex && paths[otherPathIndex] && paths[otherPathIndex].indexOf(subpath) > -1) {
						const isSubpathEnding: boolean = (start + subpathLength === segments.length);

						// Adding separator as prefix for subpath, such that 'endsWith(src, trgt)' considers subpath as directory name instead of plain string.
						// prefix is not added when either subpath is root directory or path[otherPathIndex] does not have multiple directories.
						const subpathWithSep: string = (start > 0 && paths[otherPathIndex].indexOf(nativeSep) > -1) ? nativeSep + subpath : subpath;
						const isOtherPathEnding: boolean = endsWith(paths[otherPathIndex], subpathWithSep);

						match = !isSubpathEnding || isOtherPathEnding;
					}
				}

				// found unique subpath
				if (!match) {
					let result = '';

					// preserve disk drive or root prefix
					if (endsWith(segments[0], ':') || prefix !== '') {
						if (start === 1) {
							// extend subpath to include disk drive prefix
							start = 0;
							subpathLength++;
							subpath = segments[0] + nativeSep + subpath;
						}

						if (start > 0) {
							result = segments[0] + nativeSep;
						}

						result = prefix + result;
					}

					// add ellipsis at the beginning if neeeded
					if (start > 0) {
						result = result + ellipsis + nativeSep;
					}

					result = result + subpath;

					// add ellipsis at the end if needed
					if (start + subpathLength < segments.length) {
						result = result + nativeSep + ellipsis;
					}

					shortenedPaths[pathIndex] = result;
				}
			}
		}

		if (match) {
			shortenedPaths[pathIndex] = path; // use full path if no unique subpaths found
		}
	}

	return shortenedPaths;
}

export interface ISeparator {
	label: string;
}

enum Type {
	TEXT,
	VARIABLE,
	SEPARATOR
}

interface ISegment {
	value: string;
	type: Type;
}

/**
 * Helper to insert values for specific template variables into the string. E.g. "this $(is) a $(template)" can be
 * passed to this function together with an object that maps "is" and "template" to strings to have them replaced.
 * @param value string to which templating is applied
 * @param values the values of the templates to use
 */
export function template(template: string, values: { [key: string]: string | ISeparator } = Object.create(null)): string {
	const segments: ISegment[] = [];

	let inVariable = false;
	let char: string;
	let curVal = '';
	for (let i = 0; i < template.length; i++) {
		char = template[i];

		// Beginning of variable
		if (char === '$' || (inVariable && char === '{')) {
			if (curVal) {
				segments.push({ value: curVal, type: Type.TEXT });
			}

			curVal = '';
			inVariable = true;
		}

		// End of variable
		else if (char === '}' && inVariable) {
			const resolved = values[curVal];

			// Variable
			if (typeof resolved === 'string') {
				if (resolved.length) {
					segments.push({ value: resolved, type: Type.VARIABLE });
				}
			}

			// Separator
			else if (resolved) {
				const prevSegment = segments[segments.length - 1];
				if (!prevSegment || prevSegment.type !== Type.SEPARATOR) {
					segments.push({ value: resolved.label, type: Type.SEPARATOR }); // prevent duplicate separators
				}
			}

			curVal = '';
			inVariable = false;
		}

		// Text or Variable Name
		else {
			curVal += char;
		}
	}

	// Tail
	if (curVal && !inVariable) {
		segments.push({ value: curVal, type: Type.TEXT });
	}

	return segments.filter((segment, index) => {

		// Only keep separator if we have values to the left and right
		if (segment.type === Type.SEPARATOR) {
			const left = segments[index - 1];
			const right = segments[index + 1];

			return [left, right].every(segment => segment && segment.type === Type.VARIABLE && segment.value.length > 0);
		}

		// accept any TEXT and VARIABLE
		return true;
	}).map(segment => segment.value).join('');
}