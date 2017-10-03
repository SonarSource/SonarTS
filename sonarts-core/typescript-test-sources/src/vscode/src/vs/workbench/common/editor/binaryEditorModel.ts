/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { EditorModel } from 'vs/workbench/common/editor';
import URI from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';

/**
 * An editor model that just represents a resource that can be loaded.
 */
export class BinaryEditorModel extends EditorModel {
	private name: string;
	private resource: URI;
	private size: number;
	private etag: string;

	constructor(
		resource: URI,
		name: string,
		@IFileService private fileService: IFileService
	) {
		super();

		this.name = name;
		this.resource = resource;
	}

	/**
	 * The name of the binary resource.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * The resource of the binary resource.
	 */
	public getResource(): URI {
		return this.resource;
	}

	/**
	 * The size of the binary file if known.
	 */
	public getSize(): number {
		return this.size;
	}

	/**
	 * The etag of the binary file if known.
	 */
	public getETag(): string {
		return this.etag;
	}

	public load(): TPromise<EditorModel> {
		return this.fileService.resolveFile(this.resource).then(stat => {
			this.etag = stat.etag;
			this.size = stat.size;

			return this;
		});
	}
}