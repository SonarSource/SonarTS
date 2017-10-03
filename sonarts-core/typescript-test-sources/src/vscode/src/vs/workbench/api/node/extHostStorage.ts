/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IThreadService } from 'vs/workbench/services/thread/common/threadService';
import { MainContext, MainThreadStorageShape } from './extHost.protocol';

export class ExtHostStorage {

	private _proxy: MainThreadStorageShape;

	constructor(threadService: IThreadService) {
		this._proxy = threadService.get(MainContext.MainThreadStorage);
	}

	getValue<T>(shared: boolean, key: string, defaultValue?: T): TPromise<T> {
		return this._proxy.$getValue<T>(shared, key).then(value => value || defaultValue);
	}

	setValue(shared: boolean, key: string, value: any): TPromise<void> {
		return this._proxy.$setValue(shared, key, value);
	}
}