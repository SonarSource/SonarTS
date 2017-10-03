/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/explorerviewlet';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { Dimension, Builder } from 'vs/base/browser/builder';
import { Scope } from 'vs/workbench/common/memento';
import { VIEWLET_ID, ExplorerViewletVisibleContext, IFilesConfiguration } from 'vs/workbench/parts/files/common/files';
import { IViewletView, Viewlet } from 'vs/workbench/browser/viewlet';
import { SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ActionRunner, FileViewletState } from 'vs/workbench/parts/files/browser/views/explorerViewer';
import { ExplorerView } from 'vs/workbench/parts/files/browser/views/explorerView';
import { EmptyView } from 'vs/workbench/parts/files/browser/views/emptyView';
import { OpenEditorsView } from 'vs/workbench/parts/files/browser/views/openEditorsView';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { DelegatingWorkbenchEditorService } from 'vs/workbench/services/editor/browser/editorService';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupService } from 'vs/workbench/services/group/common/groupService';
import { IContextKeyService, IContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachHeaderViewStyler } from 'vs/platform/theme/common/styler';
import { IExplorerViewsService } from 'vs/workbench/parts/explorers/common/explorer';

export class ExplorerViewlet extends Viewlet {
	private viewletContainer: Builder;
	private splitView: SplitView;
	private views: IViewletView[];

	private explorerView: ExplorerView;
	private openEditorsView: OpenEditorsView;
	private emptyView: EmptyView;

	private openEditorsVisible: boolean;
	private lastFocusedView: IViewletView;
	private focusListener: IDisposable;
	private delayEditorOpeningInOpenedEditors: boolean;

	private viewletSettings: any;
	private viewletState: FileViewletState;
	private dimension: Dimension;

	private viewletVisibleContextKey: IContextKey<boolean>;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IStorageService storageService: IStorageService,
		@IEditorGroupService private editorGroupService: IEditorGroupService,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IThemeService themeService: IThemeService,
		@IExplorerViewsService private explorerViewsService: IExplorerViewsService
	) {
		super(VIEWLET_ID, telemetryService, themeService);

		this.views = [];

		this.viewletState = new FileViewletState();
		this.viewletVisibleContextKey = ExplorerViewletVisibleContext.bindTo(contextKeyService);

		this.viewletSettings = this.getMemento(storageService, Scope.WORKSPACE);
		this.configurationService.onDidUpdateConfiguration(e => this.onConfigurationUpdated(e.config));
		this.explorerViewsService.onViewCreated(view => this.render());
	}

	public create(parent: Builder): TPromise<void> {
		super.create(parent);

		this.viewletContainer = parent.div().addClass('explorer-viewlet');

		return this.render();
	}

	public getActions(): IAction[] {
		if (this.views.length === 1) {
			return this.views[0].getActions();
		}
		return [];
	}

	private render(): TPromise<void> {
		const config = this.configurationService.getConfiguration<IFilesConfiguration>();

		// No need to delay if preview is disabled
		this.delayEditorOpeningInOpenedEditors = !!config.workbench.editor.enablePreview;

		// Open editors view should always be visible in no folder workspace.
		this.openEditorsVisible = !this.contextService.hasWorkspace() || config.explorer.openEditors.visible !== 0;

		this.dispose();
		this.views = [];
		this.viewletContainer.clearChildren();

		this.splitView = new SplitView(this.viewletContainer.getHTMLElement());

		// Track focus
		this.focusListener = this.splitView.onFocus((view: IViewletView) => {
			this.lastFocusedView = view;
		});

		const customViews = this.explorerViewsService.getViews();

		if (this.openEditorsVisible) {
			// Open editors view
			this.openEditorsView = this.instantiationService.createInstance(OpenEditorsView, this.getActionRunner(), this.viewletSettings);
			this.views.push(this.openEditorsView);
		}

		// Explorer view
		const view = this.createExplorerOrEmptyView(this.views.length || customViews.length ? undefined : 0);
		this.views.push(view);

		// custom views
		for (const view of customViews) {
			this.views.push(view.instantiate(this.getActionRunner(), this.viewletSettings, this.instantiationService));
		}

		for (let i = 0; i < this.views.length; i++) {
			const view = this.views[i];
			attachHeaderViewStyler(view, this.themeService, { noContrastBorder: i === 0 });
			this.splitView.addView(view);
		}

		this.lastFocusedView = this.explorerView;

		return TPromise.join(this.views.map(view => view.create())).then(() => void 0).then(() => {
			if (this.dimension) {
				this.layout(this.dimension);
			}

			// Update title area since the title actions have changed.
			this.updateTitleArea();
			return this.setVisible(this.isVisible()).then(() => this.focus()); // Focus the viewlet since that triggers a rerender.
		});
	}

	private onConfigurationUpdated(config: IFilesConfiguration): void {
		// Open editors view should always be visible in no folder workspace.
		const openEditorsVisible = !this.contextService.hasWorkspace() || config.explorer.openEditors.visible !== 0;
		if (this.openEditorsVisible !== openEditorsVisible) {
			this.render();
		}
	}

	private createExplorerOrEmptyView(headerSize: number): IViewletView {
		let explorerOrEmptyView: ExplorerView | EmptyView;

		// With a Workspace
		if (this.contextService.hasWorkspace()) {

			// Create a delegating editor service for the explorer to be able to delay the refresh in the opened
			// editors view above. This is a workaround for being able to double click on a file to make it pinned
			// without causing the animation in the opened editors view to kick in and change scroll position.
			// We try to be smart and only use the delay if we recognize that the user action is likely to cause
			// a new entry in the opened editors view.
			const delegatingEditorService = this.instantiationService.createInstance(DelegatingWorkbenchEditorService);
			delegatingEditorService.setEditorOpenHandler((input: EditorInput, options?: EditorOptions, arg3?: any) => {
				if (this.openEditorsView) {
					let delay = 0;
					if (this.delayEditorOpeningInOpenedEditors && (arg3 === false /* not side by side */ || typeof arg3 !== 'number' /* no explicit position */)) {
						const activeGroup = this.editorGroupService.getStacksModel().activeGroup;
						if (!activeGroup || !activeGroup.previewEditor) {
							delay = 250; // a new editor entry is likely because there is either no group or no preview in group
						}
					}

					this.openEditorsView.setStructuralRefreshDelay(delay);
				}

				const onSuccessOrError = (editor?: BaseEditor) => {
					if (this.openEditorsView) {
						this.openEditorsView.setStructuralRefreshDelay(0);
					}

					return editor;
				};

				return this.editorService.openEditor(input, options, arg3).then(onSuccessOrError, onSuccessOrError);
			});

			const explorerInstantiator = this.instantiationService.createChild(new ServiceCollection([IWorkbenchEditorService, delegatingEditorService]));
			this.explorerView = explorerOrEmptyView = explorerInstantiator.createInstance(ExplorerView, this.viewletState, this.getActionRunner(), this.viewletSettings, headerSize);
		}

		// No workspace
		else {
			this.emptyView = explorerOrEmptyView = this.instantiationService.createInstance(EmptyView, this.getActionRunner());
		}

		return explorerOrEmptyView;
	}

	public getExplorerView(): ExplorerView {
		return this.explorerView;
	}

	public getOpenEditorsView(): OpenEditorsView {
		return this.openEditorsView;
	}

	public setVisible(visible: boolean): TPromise<void> {
		this.viewletVisibleContextKey.set(visible);

		return super.setVisible(visible).then(() => {
			return TPromise.join(this.views.map((view) => view.setVisible(visible))).then(() => void 0);
		});
	}

	public focus(): void {
		super.focus();

		const hasOpenedEditors = !!this.editorGroupService.getStacksModel().activeGroup;

		if (this.lastFocusedView && this.lastFocusedView.isExpanded() && this.hasSelectionOrFocus(this.lastFocusedView)) {
			if (this.lastFocusedView !== this.openEditorsView || hasOpenedEditors) {
				this.lastFocusedView.focusBody();
				return;
			}
		}

		if (this.hasSelectionOrFocus(this.openEditorsView) && hasOpenedEditors) {
			return this.openEditorsView.focusBody();
		}

		if (this.hasSelectionOrFocus(this.explorerView)) {
			return this.explorerView.focusBody();
		}

		if (this.openEditorsView && this.openEditorsView.isExpanded() && hasOpenedEditors) {
			return this.openEditorsView.focusBody(); // we have entries in the opened editors view to focus on
		}

		if (this.explorerView && this.explorerView.isExpanded()) {
			return this.explorerView.focusBody();
		}

		if (this.emptyView && this.emptyView.isExpanded()) {
			return this.emptyView.focusBody();
		}

		return this.openEditorsView.focus();
	}

	private hasSelectionOrFocus(view: IViewletView): boolean {
		if (!view) {
			return false;
		}

		if (!view.isExpanded()) {
			return false;
		}

		if (view instanceof ExplorerView || view instanceof OpenEditorsView) {
			const viewer = view.getViewer();
			if (!viewer) {
				return false;
			}

			return !!viewer.getFocus() || (viewer.getSelection() && viewer.getSelection().length > 0);

		}

		return false;
	}

	public layout(dimension: Dimension): void {
		this.dimension = dimension;
		this.splitView.layout(dimension.height);
	}

	public getActionRunner(): IActionRunner {
		if (!this.actionRunner) {
			this.actionRunner = new ActionRunner(this.viewletState);
		}

		return this.actionRunner;
	}

	public getViewletState(): FileViewletState {
		return this.viewletState;
	}

	public getOptimalWidth(): number {
		const additionalMargin = 16;
		const openedEditorsViewWidth = this.openEditorsView ? this.openEditorsView.getOptimalWidth() : 0;
		const explorerView = this.getExplorerView();
		const explorerViewWidth = explorerView ? explorerView.getOptimalWidth() : 0;
		const optimalWidth = Math.max(openedEditorsViewWidth, explorerViewWidth);

		return optimalWidth + additionalMargin;
	}

	public shutdown(): void {
		this.views.forEach((view) => view.shutdown());

		super.shutdown();
	}

	public dispose(): void {
		if (this.splitView) {
			this.splitView.dispose();
			this.splitView = null;
		}

		if (this.explorerView) {
			this.explorerView.dispose();
			this.explorerView = null;
		}

		if (this.openEditorsView) {
			this.openEditorsView.dispose();
			this.openEditorsView = null;
		}

		if (this.emptyView) {
			this.emptyView.dispose();
			this.emptyView = null;
		}

		if (this.focusListener) {
			this.focusListener.dispose();
			this.focusListener = null;
		}
	}
}