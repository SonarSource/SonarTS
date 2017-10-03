/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { MainThreadStorageShape } from '../node/extHost.protocol';

export class MainThreadStorage extends MainThreadStorageShape {

	private _storageService: IStorageService;

	constructor( @IStorageService storageService: IStorageService) {
		super();
		this._storageService = storageService;
	}

	$getValue<T>(shared: boolean, key: string): TPromise<T> {
		let jsonValue = this._storageService.get(key, shared ? StorageScope.GLOBAL : StorageScope.WORKSPACE);
		if (!jsonValue) {
			return TPromise.as(undefined);
		}
		let value: T;
		try {
			value = JSON.parse(jsonValue);
			return TPromise.as(value);
		} catch (err) {
			return TPromise.wrapError<T>(err);
		}
	}

	$setValue(shared: boolean, key: string, value: any): TPromise<any> {
		let jsonValue: any;
		try {
			jsonValue = JSON.stringify(value);
			this._storageService.store(key, jsonValue, shared ? StorageScope.GLOBAL : StorageScope.WORKSPACE);
		} catch (err) {
			return TPromise.wrapError(err);
		}
		return undefined;
	}
}
