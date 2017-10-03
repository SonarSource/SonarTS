/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import URI from 'vs/base/common/uri';

export const IIntegrityService = createDecorator<IIntegrityService>('integrityService');

export interface ChecksumPair {
	uri: URI;
	actual: string;
	expected: string;
	isPure: boolean;
}

export interface IntegrityTestResult {
	isPure: boolean;
	proof: ChecksumPair[];
}

export interface IIntegrityService {
	_serviceBrand: any;

	isPure(): TPromise<IntegrityTestResult>;
}
