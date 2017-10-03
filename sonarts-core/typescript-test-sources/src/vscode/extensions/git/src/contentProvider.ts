/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { workspace, Uri, Disposable, Event, EventEmitter, window } from 'vscode';
import { debounce } from './decorators';
import { fromGitUri } from './uri';
import { Model } from './model';

interface CacheRow {
	uri: Uri;
	timestamp: number;
}

interface Cache {
	[uri: string]: CacheRow;
}

const THREE_MINUTES = 1000 * 60 * 3;
const FIVE_MINUTES = 1000 * 60 * 5;

export class GitContentProvider {

	private onDidChangeEmitter = new EventEmitter<Uri>();
	get onDidChange(): Event<Uri> { return this.onDidChangeEmitter.event; }

	private cache: Cache = Object.create(null);
	private disposables: Disposable[] = [];

	constructor(private model: Model) {
		this.disposables.push(
			model.onDidChangeRepository(this.eventuallyFireChangeEvents, this),
			workspace.registerTextDocumentContentProvider('git', this)
		);

		setInterval(() => this.cleanup(), FIVE_MINUTES);
	}

	@debounce(1100)
	private eventuallyFireChangeEvents(): void {
		this.fireChangeEvents();
	}

	private fireChangeEvents(): void {
		Object.keys(this.cache)
			.forEach(key => this.onDidChangeEmitter.fire(this.cache[key].uri));
	}

	async provideTextDocumentContent(uri: Uri): Promise<string> {
		const cacheKey = uri.toString();
		const timestamp = new Date().getTime();
		const cacheValue = { uri, timestamp };

		this.cache[cacheKey] = cacheValue;

		let { path, ref } = fromGitUri(uri);

		if (ref === '~') {
			const fileUri = Uri.file(path);
			const uriString = fileUri.toString();
			const [indexStatus] = this.model.indexGroup.resources.filter(r => r.original.toString() === uriString);
			ref = indexStatus ? '' : 'HEAD';
		}

		try {
			return await this.model.show(ref, path);
		} catch (err) {
			return '';
		}
	}

	private cleanup(): void {
		const now = new Date().getTime();
		const cache = Object.create(null);

		Object.keys(this.cache).forEach(key => {
			const row = this.cache[key];
			const isOpen = window.visibleTextEditors.some(e => e.document.uri.fsPath === row.uri.fsPath);

			if (isOpen || now - row.timestamp < THREE_MINUTES) {
				cache[row.uri.toString()] = row;
			}
		});

		this.cache = cache;
	}

	dispose(): void {
		this.disposables.forEach(d => d.dispose());
	}
}