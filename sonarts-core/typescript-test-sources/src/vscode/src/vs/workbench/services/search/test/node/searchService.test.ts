/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { normalize } from 'path';

import { IProgress, IUncachedSearchStats } from 'vs/platform/search/common/search';
import { ISearchEngine, IRawSearch, IRawFileMatch, ISerializedFileMatch, ISerializedSearchComplete } from 'vs/workbench/services/search/node/search';
import { SearchService as RawSearchService } from 'vs/workbench/services/search/node/rawSearchService';
import { DiskSearch } from 'vs/workbench/services/search/node/searchService';


const stats: IUncachedSearchStats = {
	fromCache: false,
	resultCount: 4,
	traversal: 'node',
	errors: [],
	fileWalkStartTime: 0,
	fileWalkResultTime: 1,
	directoriesWalked: 2,
	filesWalked: 3
};

class TestSearchEngine implements ISearchEngine<IRawFileMatch> {

	public static last: TestSearchEngine;

	private isCanceled = false;

	constructor(private result: () => IRawFileMatch, public config?: IRawSearch) {
		TestSearchEngine.last = this;
	}

	public search(onResult: (match: IRawFileMatch) => void, onProgress: (progress: IProgress) => void, done: (error: Error, complete: ISerializedSearchComplete) => void): void {
		const self = this;
		(function next() {
			process.nextTick(() => {
				if (self.isCanceled) {
					done(null, {
						limitHit: false,
						stats: stats
					});
					return;
				}
				const result = self.result();
				if (!result) {
					done(null, {
						limitHit: false,
						stats: stats
					});
				} else {
					onResult(result);
					next();
				}
			});
		})();
	}

	public cancel(): void {
		this.isCanceled = true;
	}
}

suite('SearchService', () => {

	const rawSearch: IRawSearch = {
		rootFolders: [normalize('/some/where')],
		filePattern: 'a'
	};

	const rawMatch: IRawFileMatch = {
		base: normalize('/some'),
		relativePath: 'where',
		basename: 'where',
		size: 123
	};

	const match: ISerializedFileMatch = {
		path: normalize('/some/where')
	};

	test('Individual results', function () {
		let i = 5;
		const Engine = TestSearchEngine.bind(null, () => i-- && rawMatch);
		const service = new RawSearchService();

		let results = 0;
		return service.doFileSearch(Engine, rawSearch)
			.then(() => {
				assert.strictEqual(results, 5);
			}, null, value => {
				if (!Array.isArray(value)) {
					assert.deepStrictEqual(value, match);
					results++;
				} else {
					assert.fail(value);
				}
			});
	});

	test('Batch results', function () {
		let i = 25;
		const Engine = TestSearchEngine.bind(null, () => i-- && rawMatch);
		const service = new RawSearchService();

		const results = [];
		return service.doFileSearch(Engine, rawSearch, 10)
			.then(() => {
				assert.deepStrictEqual(results, [10, 10, 5]);
			}, null, value => {
				if (Array.isArray(value)) {
					value.forEach(m => {
						assert.deepStrictEqual(m, match);
					});
					results.push(value.length);
				} else {
					assert.fail(value);
				}
			});
	});

	test('Collect batched results', function () {
		const uriPath = '/some/where';
		let i = 25;
		const Engine = TestSearchEngine.bind(null, () => i-- && rawMatch);
		const service = new RawSearchService();

		const progressResults = [];
		return DiskSearch.collectResults(service.doFileSearch(Engine, rawSearch, 10))
			.then(result => {
				assert.strictEqual(result.results.length, 25, 'Result');
				assert.strictEqual(progressResults.length, 25, 'Progress');
			}, null, match => {
				assert.strictEqual(match.resource.path, uriPath);
				progressResults.push(match);
			});
	});

	test('Sorted results', function () {
		const paths = ['bab', 'bbc', 'abb'];
		const matches: IRawFileMatch[] = paths.map(relativePath => ({
			base: normalize('/some/where'),
			relativePath,
			basename: relativePath,
			size: 3
		}));
		const Engine = TestSearchEngine.bind(null, () => matches.shift());
		const service = new RawSearchService();

		const results = [];
		return service.doFileSearch(Engine, {
			rootFolders: [normalize('/some/where')],
			filePattern: 'bb',
			sortByScore: true,
			maxResults: 2
		}, 1).then(() => {
			assert.notStrictEqual(typeof TestSearchEngine.last.config.maxResults, 'number');
			assert.deepStrictEqual(results, [normalize('/some/where/bbc'), normalize('/some/where/bab')]);
		}, null, value => {
			if (Array.isArray(value)) {
				results.push(...value.map(v => v.path));
			} else {
				assert.fail(value);
			}
		});
	});

	test('Sorted result batches', function () {
		let i = 25;
		const Engine = TestSearchEngine.bind(null, () => i-- && rawMatch);
		const service = new RawSearchService();

		const results = [];
		return service.doFileSearch(Engine, {
			rootFolders: [normalize('/some/where')],
			filePattern: 'a',
			sortByScore: true,
			maxResults: 23
		}, 10)
			.then(() => {
				assert.deepStrictEqual(results, [10, 10, 3]);
			}, null, value => {
				if (Array.isArray(value)) {
					value.forEach(m => {
						assert.deepStrictEqual(m, match);
					});
					results.push(value.length);
				} else {
					assert.fail(value);
				}
			});
	});

	test('Cached results', function () {
		const paths = ['bcb', 'bbc', 'aab'];
		const matches: IRawFileMatch[] = paths.map(relativePath => ({
			base: normalize('/some/where'),
			relativePath,
			basename: relativePath,
			size: 3
		}));
		const Engine = TestSearchEngine.bind(null, () => matches.shift());
		const service = new RawSearchService();

		const results = [];
		return service.doFileSearch(Engine, {
			rootFolders: [normalize('/some/where')],
			filePattern: 'b',
			sortByScore: true,
			cacheKey: 'x'
		}, -1).then(complete => {
			assert.strictEqual(complete.stats.fromCache, false);
			assert.deepStrictEqual(results, [normalize('/some/where/bcb'), normalize('/some/where/bbc'), normalize('/some/where/aab')]);
		}, null, value => {
			if (Array.isArray(value)) {
				results.push(...value.map(v => v.path));
			} else {
				assert.fail(value);
			}
		}).then(() => {
			const results = [];
			return service.doFileSearch(Engine, {
				rootFolders: [normalize('/some/where')],
				filePattern: 'bc',
				sortByScore: true,
				cacheKey: 'x'
			}, -1).then(complete => {
				assert.ok(complete.stats.fromCache);
				assert.deepStrictEqual(results, [normalize('/some/where/bcb'), normalize('/some/where/bbc')]);
			}, null, value => {
				if (Array.isArray(value)) {
					results.push(...value.map(v => v.path));
				} else {
					assert.fail(value);
				}
			});
		}).then(() => {
			return service.clearCache('x');
		}).then(() => {
			matches.push({
				base: normalize('/some/where'),
				relativePath: 'bc',
				basename: 'bc',
				size: 3
			});
			const results = [];
			return service.doFileSearch(Engine, {
				rootFolders: [normalize('/some/where')],
				filePattern: 'bc',
				sortByScore: true,
				cacheKey: 'x'
			}, -1).then(complete => {
				assert.strictEqual(complete.stats.fromCache, false);
				assert.deepStrictEqual(results, [normalize('/some/where/bc')]);
			}, null, value => {
				if (Array.isArray(value)) {
					results.push(...value.map(v => v.path));
				} else {
					assert.fail(value);
				}
			});
		});
	});
});