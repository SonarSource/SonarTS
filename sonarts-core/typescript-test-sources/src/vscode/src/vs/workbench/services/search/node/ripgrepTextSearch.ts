/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { EventEmitter } from 'events';
import * as path from 'path';

import * as cp from 'child_process';
import { rgPath } from 'vscode-ripgrep';

import * as strings from 'vs/base/common/strings';
import * as extfs from 'vs/base/node/extfs';
import * as encoding from 'vs/base/node/encoding';
import * as glob from 'vs/base/common/glob';
import { ILineMatch, ISearchLog } from 'vs/platform/search/common/search';
import { TPromise } from 'vs/base/common/winjs.base';

import { ISerializedFileMatch, ISerializedSearchComplete, IRawSearch } from './search';

export class RipgrepEngine {
	private isDone = false;
	private rgProc: cp.ChildProcess;
	private postProcessExclusions: glob.ParsedExpression;

	private ripgrepParser: RipgrepParser;

	private resultsHandledP: TPromise<any> = TPromise.wrap(null);

	constructor(private config: IRawSearch) {
	}

	cancel(): void {
		this.isDone = true;
		this.ripgrepParser.cancel();
		this.rgProc.kill();
	}

	// TODO@Rob - make promise-based once the old search is gone, and I don't need them to have matching interfaces anymore
	search(onResult: (match: ISerializedFileMatch) => void, onMessage: (message: ISearchLog) => void, done: (error: Error, complete: ISerializedSearchComplete) => void): void {
		if (this.config.rootFolders.length) {
			this.searchFolder(this.config.rootFolders[0], onResult, onMessage, done);
		} else {
			done(null, {
				limitHit: false,
				stats: null
			});
		}
	}

	private searchFolder(rootFolder: string, onResult: (match: ISerializedFileMatch) => void, onMessage: (message: ISearchLog) => void, done: (error: Error, complete: ISerializedSearchComplete) => void): void {
		const rgArgs = getRgArgs(this.config);
		if (rgArgs.siblingClauses) {
			this.postProcessExclusions = glob.parseToAsync(rgArgs.siblingClauses, { trimForExclusions: true });
		}

		process.nextTick(() => {
			const escapedArgs = rgArgs.args
				.map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
				.join(' ');

			// Allow caller to register progress callback
			const rgCmd = `rg ${escapedArgs}\n - cwd: ${rootFolder}\n`;
			onMessage({ message: rgCmd });
			if (rgArgs.siblingClauses) {
				onMessage({ message: ` - Sibling clauses: ${JSON.stringify(rgArgs.siblingClauses)}\n` });
			}
		});
		this.rgProc = cp.spawn(rgPath, rgArgs.args, { cwd: rootFolder });

		this.ripgrepParser = new RipgrepParser(this.config.maxResults, rootFolder);
		this.ripgrepParser.on('result', (match: ISerializedFileMatch) => {
			if (this.postProcessExclusions) {
				const relativePath = path.relative(rootFolder, match.path);
				const handleResultP = (<TPromise<string>>this.postProcessExclusions(relativePath, undefined, () => getSiblings(match.path)))
					.then(globMatch => {
						if (!globMatch) {
							onResult(match);
						}
					});

				this.resultsHandledP = TPromise.join([this.resultsHandledP, handleResultP]);
			} else {
				onResult(match);
			}
		});
		this.ripgrepParser.on('hitLimit', () => {
			this.cancel();
			done(null, {
				limitHit: true,
				stats: null
			});
		});

		this.rgProc.stdout.on('data', data => {
			this.ripgrepParser.handleData(data);
		});

		let gotData = false;
		this.rgProc.stdout.once('data', () => gotData = true);

		let stderr = '';
		this.rgProc.stderr.on('data', data => {
			const message = data.toString();
			onMessage({ message });
			stderr += message;
		});

		this.rgProc.on('close', code => {
			// Trigger last result, then wait on async result handling
			this.ripgrepParser.flush();
			this.resultsHandledP.then(() => {
				this.rgProc = null;
				if (!this.isDone) {
					this.isDone = true;
					let displayMsg: string;
					if (stderr && !gotData && (displayMsg = this.rgErrorMsgForDisplay(stderr))) {
						done(new Error(displayMsg), {
							limitHit: false,
							stats: null
						});
					} else {
						done(null, {
							limitHit: false,
							stats: null
						});
					}
				}
			});
		});
	}

	/**
	 * Read the first line of stderr and return an error for display or undefined, based on a whitelist.
	 * Ripgrep produces stderr output which is not from a fatal error, and we only want the search to be
	 * "failed" when a fatal error was produced.
	 */
	private rgErrorMsgForDisplay(msg: string): string | undefined {
		const firstLine = msg.split('\n')[0];
		if (firstLine.match(/^No files were searched, which means ripgrep/)) {
			// Not really a useful message to show in the UI
			return undefined;
		}

		// The error "No such file or directory" is returned for broken symlinks and also for bad search paths.
		// Only show it if it's from a search path.
		const reg = /^(\.\/.*): No such file or directory \(os error 2\)/;
		const noSuchFileMatch = firstLine.match(reg);
		if (noSuchFileMatch) {
			const errorPath = noSuchFileMatch[1];
			return this.config.searchPaths && this.config.searchPaths.indexOf(errorPath) >= 0 ? firstLine : undefined;
		}

		if (strings.startsWith(firstLine, 'Error parsing regex')) {
			return firstLine;
		}

		if (strings.startsWith(firstLine, 'error parsing glob')) {
			return firstLine;
		}

		return undefined;
	}
}

export class RipgrepParser extends EventEmitter {
	private static RESULT_REGEX = /^\u001b\[m(\d+)\u001b\[m:(.*)(\r?)/;
	private static FILE_REGEX = /^\u001b\[m(.+)\u001b\[m$/;

	public static MATCH_START_MARKER = '\u001b[m\u001b[31m';
	public static MATCH_END_MARKER = '\u001b[m';

	private fileMatch: FileMatch;
	private remainder: string;
	private isDone: boolean;

	private numResults = 0;

	constructor(private maxResults: number, private rootFolder: string) {
		super();
	}

	public cancel(): void {
		this.isDone = true;
	}

	public flush(): void {
		if (this.fileMatch) {
			this.onResult();
		}
	}

	public handleData(data: string | Buffer): void {
		// If the previous data chunk didn't end in a newline, prepend it to this chunk
		const dataStr = this.remainder ?
			this.remainder + data.toString() :
			data.toString();

		const dataLines: string[] = dataStr.split(/\r\n|\n/);
		this.remainder = dataLines[dataLines.length - 1] ? dataLines.pop() : null;

		for (let l = 0; l < dataLines.length; l++) {
			const outputLine = dataLines[l].trim();
			if (this.isDone) {
				break;
			}

			let r: RegExpMatchArray;
			if (r = outputLine.match(RipgrepParser.RESULT_REGEX)) {
				const lineNum = parseInt(r[1]) - 1;
				let matchText = r[2];

				// workaround https://github.com/BurntSushi/ripgrep/issues/416
				// If the match line ended with \r, append a match end marker so the match isn't lost
				if (r[3]) {
					matchText += RipgrepParser.MATCH_END_MARKER;
				}

				// Line is a result - add to collected results for the current file path
				this.handleMatchLine(outputLine, lineNum, matchText);
			} else if (r = outputLine.match(RipgrepParser.FILE_REGEX)) {
				// Line is a file path - send all collected results for the previous file path
				if (this.fileMatch) {
					this.onResult();
				}

				this.fileMatch = new FileMatch(path.join(this.rootFolder, r[1]));
			} else {
				// Line is empty (or malformed)
			}
		}
	}

	private handleMatchLine(outputLine: string, lineNum: number, text: string): void {
		const lineMatch = new LineMatch(text, lineNum);
		this.fileMatch.addMatch(lineMatch);

		let lastMatchEndPos = 0;
		let matchTextStartPos = -1;

		// Track positions with color codes subtracted - offsets in the final text preview result
		let matchTextStartRealIdx = -1;
		let textRealIdx = 0;
		let hitLimit = false;

		const realTextParts: string[] = [];

		for (let i = 0; i < text.length - (RipgrepParser.MATCH_END_MARKER.length - 1);) {
			if (text.substr(i, RipgrepParser.MATCH_START_MARKER.length) === RipgrepParser.MATCH_START_MARKER) {
				// Match start
				const chunk = text.slice(lastMatchEndPos, i);
				realTextParts.push(chunk);
				i += RipgrepParser.MATCH_START_MARKER.length;
				matchTextStartPos = i;
				matchTextStartRealIdx = textRealIdx;
			} else if (text.substr(i, RipgrepParser.MATCH_END_MARKER.length) === RipgrepParser.MATCH_END_MARKER) {
				// Match end
				const chunk = text.slice(matchTextStartPos, i);
				realTextParts.push(chunk);
				if (!hitLimit) {
					lineMatch.addMatch(matchTextStartRealIdx, textRealIdx - matchTextStartRealIdx);
				}

				matchTextStartPos = -1;
				matchTextStartRealIdx = -1;
				i += RipgrepParser.MATCH_END_MARKER.length;
				lastMatchEndPos = i;
				this.numResults++;

				// Check hit maxResults limit
				if (this.numResults >= this.maxResults) {
					// Finish the line, then report the result below
					hitLimit = true;
				}
			} else {
				i++;
				textRealIdx++;
			}
		}

		const chunk = text.slice(lastMatchEndPos);
		realTextParts.push(chunk);

		// Replace preview with version without color codes
		const preview = realTextParts.join('');
		lineMatch.preview = preview;

		if (hitLimit) {
			this.cancel();
			this.onResult();
			this.emit('hitLimit');
		}
	}

	private onResult(): void {
		this.emit('result', this.fileMatch.serialize());
		this.fileMatch = null;
	}
}

export class FileMatch implements ISerializedFileMatch {
	path: string;
	lineMatches: LineMatch[];

	constructor(path: string) {
		this.path = path;
		this.lineMatches = [];
	}

	addMatch(lineMatch: LineMatch): void {
		this.lineMatches.push(lineMatch);
	}

	isEmpty(): boolean {
		return this.lineMatches.length === 0;
	}

	serialize(): ISerializedFileMatch {
		let lineMatches: ILineMatch[] = [];
		let numMatches = 0;

		for (let i = 0; i < this.lineMatches.length; i++) {
			numMatches += this.lineMatches[i].offsetAndLengths.length;
			lineMatches.push(this.lineMatches[i].serialize());
		}

		return {
			path: this.path,
			lineMatches,
			numMatches
		};
	}
}

export class LineMatch implements ILineMatch {
	preview: string;
	lineNumber: number;
	offsetAndLengths: number[][];

	constructor(preview: string, lineNumber: number) {
		this.preview = preview.replace(/(\r|\n)*$/, '');
		this.lineNumber = lineNumber;
		this.offsetAndLengths = [];
	}

	getText(): string {
		return this.preview;
	}

	getLineNumber(): number {
		return this.lineNumber;
	}

	addMatch(offset: number, length: number): void {
		this.offsetAndLengths.push([offset, length]);
	}

	serialize(): ILineMatch {
		const result = {
			preview: this.preview,
			lineNumber: this.lineNumber,
			offsetAndLengths: this.offsetAndLengths
		};

		return result;
	}
}

function globExprsToRgGlobs(patterns: glob.IExpression): { globArgs: string[], siblingClauses: glob.IExpression } {
	const globArgs: string[] = [];
	let siblingClauses: glob.IExpression = null;
	Object.keys(patterns)
		.forEach(key => {
			const value = patterns[key];
			if (typeof value === 'boolean' && value) {
				// globs added to ripgrep don't match from the root by default, so add a /
				if (key.charAt(0) !== '*') {
					key = '/' + key;
				}

				globArgs.push(key);
			} else if (value && value.when) {
				if (!siblingClauses) {
					siblingClauses = {};
				}

				siblingClauses[key] = value;
			}
		});

	return { globArgs, siblingClauses };
}

function getRgArgs(config: IRawSearch): { args: string[], siblingClauses: glob.IExpression } {
	const args = ['--hidden', '--heading', '--line-number', '--color', 'ansi', '--colors', 'path:none', '--colors', 'line:none', '--colors', 'match:fg:red', '--colors', 'match:style:nobold'];
	args.push(config.contentPattern.isCaseSensitive ? '--case-sensitive' : '--ignore-case');

	if (config.includePattern) {
		// I don't think includePattern can have siblingClauses
		globExprsToRgGlobs(config.includePattern).globArgs.forEach(globArg => {
			args.push('-g', globArg);
		});
	}

	let siblingClauses: glob.IExpression;
	if (config.excludePattern) {
		const rgGlobs = globExprsToRgGlobs(config.excludePattern);
		rgGlobs.globArgs
			.forEach(rgGlob => args.push('-g', `!${rgGlob}`));
		siblingClauses = rgGlobs.siblingClauses;
	}

	if (config.maxFilesize) {
		args.push('--max-filesize', config.maxFilesize + '');
	}

	if (config.disregardIgnoreFiles) {
		// Don't use .gitignore or .ignore
		args.push('--no-ignore');
	}

	// Follow symlinks
	args.push('--follow');

	// Set default encoding
	if (config.fileEncoding && config.fileEncoding !== 'utf8') {
		args.push('--encoding', encoding.toCanonicalName(config.fileEncoding));
	}

	let searchPatternAfterDoubleDashes: string;
	if (config.contentPattern.isWordMatch) {
		const regexp = strings.createRegExp(config.contentPattern.pattern, config.contentPattern.isRegExp, { wholeWord: config.contentPattern.isWordMatch });
		const regexpStr = regexp.source.replace(/\\\//g, '/'); // RegExp.source arbitrarily returns escaped slashes. Search and destroy.
		args.push('--regexp', regexpStr);
	} else if (config.contentPattern.isRegExp) {
		args.push('--regexp', config.contentPattern.pattern);
	} else {
		searchPatternAfterDoubleDashes = config.contentPattern.pattern;
		args.push('--fixed-strings');
	}

	// Folder to search
	args.push('--');

	if (searchPatternAfterDoubleDashes) {
		// Put the query after --, in case the query starts with a dash
		args.push(searchPatternAfterDoubleDashes);
	}

	if (config.searchPaths && config.searchPaths.length) {
		args.push(...config.searchPaths);
	} else {
		args.push('./');
	}

	return { args, siblingClauses };
}

function getSiblings(file: string): TPromise<string[]> {
	return new TPromise<string[]>((resolve, reject) => {
		extfs.readdir(path.dirname(file), (error: Error, files: string[]) => {
			if (error) {
				reject(error);
			}

			resolve(files);
		});
	});
}
