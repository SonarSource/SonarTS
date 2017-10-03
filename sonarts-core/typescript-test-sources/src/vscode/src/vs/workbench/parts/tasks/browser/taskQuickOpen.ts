/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import nls = require('vs/nls');
import { TPromise } from 'vs/base/common/winjs.base';
import QuickOpen = require('vs/base/parts/quickopen/common/quickOpen');
import Model = require('vs/base/parts/quickopen/browser/quickOpenModel');
import { IQuickOpenService } from 'vs/platform/quickOpen/common/quickOpen';

import { Task } from 'vs/workbench/parts/tasks/common/tasks';
import { ITaskService } from 'vs/workbench/parts/tasks/common/taskService';
import { IExtensionService } from 'vs/platform/extensions/common/extensions';


import * as base from './quickOpen';

class TaskEntry extends base.TaskEntry {
	constructor(taskService: ITaskService, task: Task, highlights: Model.IHighlight[] = []) {
		super(taskService, task, highlights);
	}

	public getAriaLabel(): string {
		return nls.localize('entryAriaLabel', "{0}, tasks", this.getLabel());
	}

	public run(mode: QuickOpen.Mode, context: Model.IContext): boolean {
		if (mode === QuickOpen.Mode.PREVIEW) {
			return false;
		}
		this.taskService.run(this.task);
		return true;
	}
}

export class QuickOpenHandler extends base.QuickOpenHandler {
	private activationPromise: TPromise<void>;

	constructor(
		@IQuickOpenService quickOpenService: IQuickOpenService,
		@ITaskService taskService: ITaskService,
		@IExtensionService extensionService: IExtensionService
	) {
		super(quickOpenService, taskService);
		this.activationPromise = extensionService.activateByEvent('onCommand:workbench.action.tasks.runTask');
	}

	public getAriaLabel(): string {
		return nls.localize('tasksAriaLabel', "Type the name of a task to run");
	}

	protected getTasks(): TPromise<Task[]> {
		return this.activationPromise.then(() => {
			return this.taskService.tasks();
		});
	}

	protected createEntry(taskService: ITaskService, task: Task, highlights: Model.IHighlight[]): base.TaskEntry {
		return new TaskEntry(taskService, task, highlights);
	}

	public getEmptyLabel(searchString: string): string {
		if (searchString.length > 0) {
			return nls.localize('noTasksMatching', "No tasks matching");
		}
		return nls.localize('noTasksFound', "No tasks found");
	}
}