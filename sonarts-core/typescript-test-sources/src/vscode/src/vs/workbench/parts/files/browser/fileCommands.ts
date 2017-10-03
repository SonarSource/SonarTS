/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import nls = require('vs/nls');
import paths = require('vs/base/common/paths');
import severity from 'vs/base/common/severity';
import { TPromise } from 'vs/base/common/winjs.base';
import URI from 'vs/base/common/uri';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { toResource } from 'vs/workbench/common/editor';
import { IWindowsService, IWindowService } from 'vs/platform/windows/common/windows';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IViewletService } from 'vs/workbench/services/viewlet/browser/viewlet';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ExplorerViewlet } from 'vs/workbench/parts/files/browser/explorerViewlet';
import { VIEWLET_ID, explorerItemToFileResource } from 'vs/workbench/parts/files/common/files';
import { FileStat, OpenEditor } from 'vs/workbench/parts/files/common/explorerViewModel';
import errors = require('vs/base/common/errors');
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import labels = require('vs/base/common/labels');
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
import { IMessageService } from 'vs/platform/message/common/message';

// Commands

export const copyPathCommand = (accessor: ServicesAccessor, resource?: URI) => {

	// Without resource, try to look at the active editor
	if (!resource) {
		const editorGroupService = accessor.get(IEditorGroupService);
		const editorService = accessor.get(IWorkbenchEditorService);
		const activeEditor = editorService.getActiveEditor();

		resource = activeEditor ? toResource(activeEditor.input, { supportSideBySide: true, filter: 'file' }) : void 0;
		if (activeEditor) {
			editorGroupService.focusGroup(activeEditor.position); // focus back to active editor group
		}
	}

	if (resource) {
		const clipboardService = accessor.get(IClipboardService);
		clipboardService.writeText(labels.getPathLabel(resource));
	} else {
		const messageService = accessor.get(IMessageService);
		messageService.show(severity.Info, nls.localize('openFileToCopy', "Open a file first to copy its path"));
	}
};

export const openFolderPickerCommand = (accessor: ServicesAccessor, forceNewWindow: boolean) => {
	const windowService = accessor.get(IWindowService);

	windowService.openFolderPicker(forceNewWindow);
};

export const openWindowCommand = (accessor: ServicesAccessor, paths: string[], forceNewWindow: boolean) => {
	const windowsService = accessor.get(IWindowsService);
	windowsService.openWindow(paths, { forceNewWindow });
};

export const openFileInNewWindowCommand = (accessor: ServicesAccessor) => {
	const windowService = accessor.get(IWindowService);
	const editorService = accessor.get(IWorkbenchEditorService);

	const fileResource = toResource(editorService.getActiveEditorInput(), { supportSideBySide: true, filter: 'file' });

	windowService.openFilePicker(true, fileResource ? paths.dirname(fileResource.fsPath) : void 0);
};

export const revealInOSCommand = (accessor: ServicesAccessor, resource?: URI) => {

	// Without resource, try to look at the active editor
	if (!resource) {
		const editorService = accessor.get(IWorkbenchEditorService);

		resource = toResource(editorService.getActiveEditorInput(), { supportSideBySide: true, filter: 'file' });
	}

	if (resource) {
		const windowsService = accessor.get(IWindowsService);
		windowsService.showItemInFolder(paths.normalize(resource.fsPath, true));
	} else {
		const messageService = accessor.get(IMessageService);
		messageService.show(severity.Info, nls.localize('openFileToReveal', "Open a file first to reveal"));
	}
};

export const revealInExplorerCommand = (accessor: ServicesAccessor, resource: URI) => {
	const viewletService = accessor.get(IViewletService);
	const contextService = accessor.get(IWorkspaceContextService);

	viewletService.openViewlet(VIEWLET_ID, false).then((viewlet: ExplorerViewlet) => {
		const isInsideWorkspace = contextService.isInsideWorkspace(resource);
		if (isInsideWorkspace) {
			const explorerView = viewlet.getExplorerView();
			if (explorerView) {
				explorerView.expand();
				explorerView.select(resource, true);
			}
		} else {
			const openEditorsView = viewlet.getOpenEditorsView();
			if (openEditorsView) {
				openEditorsView.expand();
			}
		}
	});
};

function openFocusedFilesExplorerViewItem(accessor: ServicesAccessor, sideBySide: boolean): void {
	withFocussedFilesExplorerViewItem(accessor).then(res => {
		if (res) {

			// Directory: Toggle expansion
			if (res.item.isDirectory) {
				res.tree.toggleExpansion(res.item);
			}

			// File: Open
			else {
				const editorService = accessor.get(IWorkbenchEditorService);
				editorService.openEditor({ resource: res.item.resource }, sideBySide).done(null, errors.onUnexpectedError);
			}
		}
	});
}

function openFocussedOpenedEditorsViewItem(accessor: ServicesAccessor, sideBySide: boolean): void {
	withFocussedOpenEditorsViewItem(accessor).then(res => {
		if (res) {
			const editorService = accessor.get(IWorkbenchEditorService);

			editorService.openEditor(res.item.editorInput, null, sideBySide);
		}
	});
}

function runActionOnFocusedFilesExplorerViewItem(accessor: ServicesAccessor, id: string, context?: any): void {
	withFocussedFilesExplorerViewItem(accessor).then(res => {
		if (res) {
			res.explorer.getViewletState().actionProvider.runAction(res.tree, res.item, id, context).done(null, errors.onUnexpectedError);
		}
	});
}

function withVisibleExplorer(accessor: ServicesAccessor): TPromise<ExplorerViewlet> {
	const viewletService = accessor.get(IViewletService);

	const activeViewlet = viewletService.getActiveViewlet();
	if (!activeViewlet || activeViewlet.getId() !== VIEWLET_ID) {
		return TPromise.as(void 0); // Return early if the active viewlet is not the explorer
	}

	return viewletService.openViewlet(VIEWLET_ID, false);
};

export function withFocussedFilesExplorerViewItem(accessor: ServicesAccessor): TPromise<{ explorer: ExplorerViewlet, tree: ITree, item: FileStat }> {
	return withFocussedFilesExplorer(accessor).then(res => {
		if (!res) {
			return void 0;
		}

		const { tree, explorer } = res;
		if (!tree || !tree.getFocus()) {
			return void 0;
		}

		return { explorer, tree, item: tree.getFocus() };
	});
};

export function withFocussedFilesExplorer(accessor: ServicesAccessor): TPromise<{ explorer: ExplorerViewlet, tree: ITree }> {
	return withVisibleExplorer(accessor).then(explorer => {
		if (!explorer || !explorer.getExplorerView()) {
			return void 0; // empty folder or hidden explorer
		}

		const tree = explorer.getExplorerView().getViewer();

		// Ignore if in highlight mode or not focussed
		if (tree.getHighlight() || !tree.isDOMFocused()) {
			return void 0;
		}

		return { explorer, tree };
	});
};

function withFocussedOpenEditorsViewItem(accessor: ServicesAccessor): TPromise<{ explorer: ExplorerViewlet, tree: ITree, item: OpenEditor }> {
	return withVisibleExplorer(accessor).then(explorer => {
		if (!explorer || !explorer.getOpenEditorsView()) {
			return void 0; // empty folder or hidden explorer
		}

		const tree = explorer.getOpenEditorsView().getViewer();

		// Ignore if in highlight mode or not focussed
		const focus = tree.getFocus();
		if (tree.getHighlight() || !tree.isDOMFocused() || !(focus instanceof OpenEditor)) {
			return void 0;
		}

		return { explorer, tree, item: focus };
	});
};

function withFocusedExplorerItem(accessor: ServicesAccessor): TPromise<FileStat | OpenEditor> {
	return withFocussedFilesExplorerViewItem(accessor).then(res => {
		if (res) {
			return res.item;
		}

		return withFocussedOpenEditorsViewItem(accessor).then(res => {
			if (res) {
				return res.item;
			}

			return void 0;
		});
	}) as TPromise<FileStat | OpenEditor>; // TypeScript fail
};

export const renameFocusedFilesExplorerViewItemCommand = (accessor: ServicesAccessor) => {
	runActionOnFocusedFilesExplorerViewItem(accessor, 'renameFile');
};

export const deleteFocusedFilesExplorerViewItemCommand = (accessor: ServicesAccessor) => {
	runActionOnFocusedFilesExplorerViewItem(accessor, 'moveFileToTrash', { useTrash: false });
};

export const moveFocusedFilesExplorerViewItemToTrashCommand = (accessor: ServicesAccessor) => {
	runActionOnFocusedFilesExplorerViewItem(accessor, 'moveFileToTrash', { useTrash: true });
};

export const copyFocusedFilesExplorerViewItem = (accessor: ServicesAccessor) => {
	runActionOnFocusedFilesExplorerViewItem(accessor, 'filesExplorer.copy');
};

export const copyPathOfFocusedExplorerItem = (accessor: ServicesAccessor) => {
	withFocusedExplorerItem(accessor).then(item => {
		const file = explorerItemToFileResource(item);
		if (file) {
			copyPathCommand(accessor, file.resource);
		}
	});
};

export const openFocusedExplorerItemSideBySideCommand = (accessor: ServicesAccessor) => {
	withFocusedExplorerItem(accessor).then(item => {
		if (item instanceof FileStat) {
			openFocusedFilesExplorerViewItem(accessor, true);
		} else {
			openFocussedOpenedEditorsViewItem(accessor, true);
		}
	});
};

export const revealInOSFocusedFilesExplorerItem = (accessor: ServicesAccessor) => {
	withFocusedExplorerItem(accessor).then(item => {
		const file = explorerItemToFileResource(item);
		if (file) {
			revealInOSCommand(accessor, file.resource);
		}
	});
};
