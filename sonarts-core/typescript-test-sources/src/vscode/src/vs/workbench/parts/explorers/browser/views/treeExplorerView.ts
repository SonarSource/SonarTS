/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import nls = require('vs/nls');
import { TPromise } from 'vs/base/common/winjs.base';
import * as DOM from 'vs/base/browser/dom';
import { Builder, $ } from 'vs/base/browser/builder';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { CollapsibleViewletView } from 'vs/workbench/browser/viewlet';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { IAction, IActionRunner, IActionItem } from 'vs/base/common/actions';
import { IMessageService } from 'vs/platform/message/common/message';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListService } from 'vs/platform/list/browser/listService';
import { ITreeExplorerService } from 'vs/workbench/parts/explorers/common/treeExplorerService';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { Tree } from 'vs/base/parts/tree/browser/treeImpl';
import { TreeExplorerViewletState, TreeDataSource, TreeRenderer, TreeController } from 'vs/workbench/parts/explorers/browser/views/treeExplorerViewer';
import { TreeExplorerMenus } from 'vs/workbench/parts/explorers/browser/treeExplorerMenus';
import { RefreshViewExplorerAction } from 'vs/workbench/parts/explorers/browser/treeExplorerActions';
import { attachListStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { createActionItem } from 'vs/platform/actions/browser/menuItemActionItem';

export class TreeExplorerView extends CollapsibleViewletView {

	private providerDisposables: IDisposable[];
	private menus: TreeExplorerMenus;

	constructor(
		private viewletState: TreeExplorerViewletState,
		private treeNodeProviderId: string,
		actionRunner: IActionRunner,
		headerSize: number,
		@IMessageService messageService: IMessageService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ITreeExplorerService private treeExplorerService: ITreeExplorerService,
		@IListService private listService: IListService,
		@IThemeService private themeService: IThemeService
	) {
		super(actionRunner, false, nls.localize('treeExplorerViewlet.tree', "Tree Explorer Section"), messageService, keybindingService, contextMenuService, headerSize);
		this.treeExplorerService.activeProvider = treeNodeProviderId;
		this.menus = this.instantiationService.createInstance(TreeExplorerMenus);
		this.create();
	}

	public renderBody(container: HTMLElement): void {
		this.treeContainer = super.renderViewTree(container);
		DOM.addClass(this.treeContainer, 'tree-explorer-viewlet-tree-view');

		this.tree = this.createViewer($(this.treeContainer));
	}

	public createViewer(container: Builder): ITree {
		const dataSource = this.instantiationService.createInstance(TreeDataSource, this.treeNodeProviderId);
		const renderer = this.instantiationService.createInstance(TreeRenderer, this.viewletState, this.actionRunner, container.getHTMLElement());
		const controller = this.instantiationService.createInstance(TreeController, this.treeNodeProviderId, this.menus);

		const tree = new Tree(container.getHTMLElement(), {
			dataSource,
			renderer,
			controller
		}, {
				keyboardSupport: false
			});

		this.toDispose.push(attachListStyler(tree, this.themeService));
		this.toDispose.push(this.listService.register(tree));

		return tree;
	}

	getActions(): IAction[] {
		return [...this.menus.getTitleActions(), new RefreshViewExplorerAction(this)];
	}

	getSecondaryActions(): IAction[] {
		return this.menus.getTitleSecondaryActions();
	}

	getActionItem(action: IAction): IActionItem {
		return createActionItem(action, this.keybindingService, this.messageService);
	}

	public create(): TPromise<void> {
		return this.updateInput();
	}

	public setVisible(visible: boolean): TPromise<void> {
		return super.setVisible(visible);
	}

	public updateInput(): TPromise<void> {
		if (this.treeExplorerService.hasProvider(this.treeNodeProviderId)) {
			return this.updateProvider();
		}
		// Provider registration happens independently of the reading of extension's contribution,
		// which constructs the viewlet, so it's possible the viewlet is constructed before a provider
		// is registered.
		// This renders the viewlet first and wait for a corresponding provider is registered.
		else {
			this.treeExplorerService.onTreeExplorerNodeProviderRegistered(providerId => {
				if (this.treeNodeProviderId === providerId) {
					return this.updateProvider();
				}
				return undefined;
			});

			return TPromise.as(null);
		}
	}

	public getOptimalWidth(): number {
		const parentNode = this.tree.getHTMLElement();
		const childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));

		return DOM.getLargestChildWidth(parentNode, childNodes);
	}

	private updateProvider(): TPromise<void> {
		if (this.providerDisposables) {
			dispose(this.providerDisposables);
		}

		const provider = this.treeExplorerService.getProvider(this.treeNodeProviderId);
		provider.onRefresh(node => this.tree.refresh(node));
		return this.treeExplorerService.provideRootNode(this.treeNodeProviderId).then(tree => {
			this.tree.setInput(tree);
		});
	}
}
