/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/search.contribution';
import { Registry } from 'vs/platform/platform';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ViewletRegistry, Extensions as ViewletExtensions, ViewletDescriptor } from 'vs/workbench/browser/viewlet';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import nls = require('vs/nls');
import { IAction } from 'vs/base/common/actions';
import { explorerItemToFileResource } from 'vs/workbench/parts/files/common/files';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { Scope, IActionBarRegistry, Extensions as ActionBarExtensions, ActionBarContributor } from 'vs/workbench/browser/actionBarRegistry';
import { IWorkbenchActionRegistry, Extensions as ActionExtensions } from 'vs/workbench/common/actionRegistry';
import { QuickOpenHandlerDescriptor, IQuickOpenRegistry, Extensions as QuickOpenExtensions, QuickOpenAction } from 'vs/workbench/browser/quickopen';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IQuickOpenService } from 'vs/platform/quickOpen/common/quickOpen';
import { IViewletService } from 'vs/workbench/services/viewlet/browser/viewlet';
import { KeyMod, KeyCode } from 'vs/base/common/keyCodes';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import * as searchActions from 'vs/workbench/parts/search/browser/searchActions';
import * as Constants from 'vs/workbench/parts/search/common/constants';
import { registerContributions as replaceContributions } from 'vs/workbench/parts/search/browser/replaceContributions';
import { registerContributions as searchWidgetContributions } from 'vs/workbench/parts/search/browser/searchWidget';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ToggleCaseSensitiveKeybinding, ToggleRegexKeybinding, ToggleWholeWordKeybinding, ShowPreviousFindTermKeybinding, ShowNextFindTermKeybinding } from 'vs/editor/contrib/find/common/findModel';
import { ISearchWorkbenchService, SearchWorkbenchService } from 'vs/workbench/parts/search/common/searchModel';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { SearchViewlet } from 'vs/workbench/parts/search/browser/searchViewlet';
import { ListFocusContext } from 'vs/platform/list/browser/listService';

import { IOutputChannelRegistry, Extensions as OutputExt } from 'vs/workbench/parts/output/common/output';

registerSingleton(ISearchWorkbenchService, SearchWorkbenchService);
replaceContributions();
searchWidgetContributions();

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: 'workbench.action.search.toggleQueryDetails',
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: Constants.SearchViewletVisibleKey,
	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_J,
	handler: accessor => {
		let viewletService = accessor.get(IViewletService);
		viewletService.openViewlet(Constants.VIEWLET_ID, true)
			.then((viewlet: SearchViewlet) => viewlet.toggleQueryDetails());
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.FocusSearchFromResults,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FirstMatchFocusKey),
	primary: KeyCode.UpArrow,
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		searchViewlet.focusPreviousInputBox();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.OpenMatchToSide,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FileMatchOrMatchFocusKey),
	primary: KeyMod.CtrlCmd | KeyCode.Enter,
	mac: {
		primary: KeyMod.WinCtrl | KeyCode.Enter
	},
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		const tree: ITree = searchViewlet.getControl();
		searchViewlet.open(tree.getFocus(), false, true, true);
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.CancelActionId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, ListFocusContext),
	primary: KeyCode.Escape,
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		searchViewlet.cancelSearch();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.RemoveActionId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.FileMatchOrMatchFocusKey),
	primary: KeyCode.Delete,
	mac: {
		primary: KeyMod.CtrlCmd | KeyCode.Backspace,
	},
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		const tree: ITree = searchViewlet.getControl();
		accessor.get(IInstantiationService).createInstance(searchActions.RemoveAction, tree, tree.getFocus(), searchViewlet).run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.ReplaceActionId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey),
	primary: KeyMod.Shift | KeyMod.CtrlCmd | KeyCode.KEY_1,
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		const tree: ITree = searchViewlet.getControl();
		accessor.get(IInstantiationService).createInstance(searchActions.ReplaceAction, tree, tree.getFocus(), searchViewlet).run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.ReplaceAllInFileActionId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey),
	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter,
	handler: (accessor, args: any) => {
		const searchViewlet: SearchViewlet = <SearchViewlet>accessor.get(IViewletService).getActiveViewlet();
		const tree: ITree = searchViewlet.getControl();
		accessor.get(IInstantiationService).createInstance(searchActions.ReplaceAllAction, tree, tree.getFocus(), searchViewlet).run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: Constants.CloseReplaceWidgetActionId,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.ReplaceInputBoxFocussedKey),
	primary: KeyCode.Escape,
	handler: (accessor, args: any) => {
		accessor.get(IInstantiationService).createInstance(searchActions.CloseReplaceAction, Constants.CloseReplaceWidgetActionId, '').run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: searchActions.ShowNextSearchTermAction.ID,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey),
	primary: ShowNextFindTermKeybinding.primary,
	handler: (accessor, args: any) => {
		accessor.get(IInstantiationService).createInstance(searchActions.ShowNextSearchTermAction, searchActions.ShowNextSearchTermAction.ID, '').run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: searchActions.ShowPreviousSearchTermAction.ID,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey),
	primary: ShowPreviousFindTermKeybinding.primary,
	handler: (accessor, args: any) => {
		accessor.get(IInstantiationService).createInstance(searchActions.ShowPreviousSearchTermAction, searchActions.ShowPreviousSearchTermAction.ID, '').run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: searchActions.FocusNextInputAction.ID,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.InputBoxFocussedKey),
	primary: KeyCode.DownArrow,
	handler: (accessor, args: any) => {
		accessor.get(IInstantiationService).createInstance(searchActions.FocusNextInputAction, searchActions.FocusNextInputAction.ID, '').run();
	}
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: searchActions.FocusPreviousInputAction.ID,
	weight: KeybindingsRegistry.WEIGHT.workbenchContrib(),
	when: ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.InputBoxFocussedKey, Constants.SearchInputBoxFocussedKey.toNegated()),
	primary: KeyCode.UpArrow,
	handler: (accessor, args: any) => {
		accessor.get(IInstantiationService).createInstance(searchActions.FocusPreviousInputAction, searchActions.FocusPreviousInputAction.ID, '').run();
	}
});

CommandsRegistry.registerCommand(searchActions.FindInFolderAction.ID, searchActions.findInFolderCommand);

class ExplorerViewerActionContributor extends ActionBarContributor {
	private _instantiationService: IInstantiationService;
	private _contextService: IWorkspaceContextService;

	constructor( @IInstantiationService instantiationService: IInstantiationService, @IWorkspaceContextService contextService: IWorkspaceContextService) {
		super();

		this._instantiationService = instantiationService;
		this._contextService = contextService;
	}

	public hasSecondaryActions(context: any): boolean {
		let element = context.element;

		// Contribute only on file resources
		let fileResource = explorerItemToFileResource(element);
		if (!fileResource) {
			return false;
		}

		return fileResource.isDirectory;
	}

	public getSecondaryActions(context: any): IAction[] {
		let actions: IAction[] = [];

		if (this.hasSecondaryActions(context)) {
			let fileResource = explorerItemToFileResource(context.element);

			let action = this._instantiationService.createInstance(searchActions.FindInFolderAction, fileResource.resource);
			action.order = 55;
			actions.push(action);

			actions.push(new Separator('', 56));
		}

		return actions;
	}
}

const ACTION_ID = 'workbench.action.showAllSymbols';
const ACTION_LABEL = nls.localize('showTriggerActions', "Go to Symbol in Workspace...");
const ALL_SYMBOLS_PREFIX = '#';

class ShowAllSymbolsAction extends QuickOpenAction {

	constructor(actionId: string, actionLabel: string, @IQuickOpenService quickOpenService: IQuickOpenService) {
		super(actionId, actionLabel, ALL_SYMBOLS_PREFIX, quickOpenService);
	}
}

// Register Viewlet
Registry.as<ViewletRegistry>(ViewletExtensions.Viewlets).registerViewlet(new ViewletDescriptor(
	'vs/workbench/parts/search/browser/searchViewlet',
	'SearchViewlet',
	Constants.VIEWLET_ID,
	nls.localize('name', "Search"),
	'search',
	10
));

// Actions
const registry = Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions);

registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.OpenSearchViewletAction, Constants.VIEWLET_ID, nls.localize('showSearchViewlet', "Show Search"), { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F },
	Constants.SearchViewletVisibleKey.toNegated()), 'View: Show Search', nls.localize('view', "View"));
registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.FocusActiveEditorAction, Constants.FocusActiveEditorActionId, '', { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F },
	ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey)), '');
registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.FindInFilesAction, Constants.FindInFilesActionId, nls.localize('findInFiles', "Find in Files"), { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_F },
	Constants.SearchInputBoxFocussedKey.toNegated()), 'Find in Files');

registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.FocusNextSearchResultAction, searchActions.FocusNextSearchResultAction.ID, searchActions.FocusNextSearchResultAction.LABEL, { primary: KeyCode.F4 }), '');
registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.FocusPreviousSearchResultAction, searchActions.FocusPreviousSearchResultAction.ID, searchActions.FocusPreviousSearchResultAction.LABEL, { primary: KeyMod.Shift | KeyCode.F4 }), '');

registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.ReplaceInFilesAction, searchActions.ReplaceInFilesAction.ID, searchActions.ReplaceInFilesAction.LABEL, { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_H }), 'Replace in Files');

registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.ToggleCaseSensitiveAction, Constants.ToggleCaseSensitiveActionId, '', ToggleCaseSensitiveKeybinding, ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey)), '');
registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.ToggleWholeWordAction, Constants.ToggleWholeWordActionId, '', ToggleWholeWordKeybinding, ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey)), '');
registry.registerWorkbenchAction(new SyncActionDescriptor(searchActions.ToggleRegexAction, Constants.ToggleRegexActionId, '', ToggleRegexKeybinding, ContextKeyExpr.and(Constants.SearchViewletVisibleKey, Constants.SearchInputBoxFocussedKey)), '');

registry.registerWorkbenchAction(new SyncActionDescriptor(ShowAllSymbolsAction, ACTION_ID, ACTION_LABEL, { primary: KeyMod.CtrlCmd | KeyCode.KEY_T }), 'Go to Symbol in Workspace...');

// Contribute to Explorer Viewer
const actionBarRegistry = Registry.as<IActionBarRegistry>(ActionBarExtensions.Actionbar);
actionBarRegistry.registerActionBarContributor(Scope.VIEWER, ExplorerViewerActionContributor);

// Register Quick Open Handler
Registry.as<IQuickOpenRegistry>(QuickOpenExtensions.Quickopen).registerDefaultQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		'vs/workbench/parts/search/browser/openAnythingHandler',
		'OpenAnythingHandler',
		'',
		nls.localize('openAnythingHandlerDescription', "Go to File")
	)
);

Registry.as<IQuickOpenRegistry>(QuickOpenExtensions.Quickopen).registerQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		'vs/workbench/parts/search/browser/openAnythingHandler',
		'OpenSymbolHandler',
		ALL_SYMBOLS_PREFIX,
		[
			{
				prefix: ALL_SYMBOLS_PREFIX,
				needsEditor: false,
				description: nls.localize('openSymbolDescriptionNormal', "Go to Symbol in Workspace")
			}
		]
	)
);

// Search output channel
const outputChannelRegistry = <IOutputChannelRegistry>Registry.as(OutputExt.OutputChannels);
outputChannelRegistry.registerChannel('search', nls.localize('searchOutputChannelTitle', "Search"));

// Configuration
const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	'id': 'search',
	'order': 13,
	'title': nls.localize('searchConfigurationTitle', "Search"),
	'type': 'object',
	'properties': {
		'search.exclude': {
			'type': 'object',
			'description': nls.localize('exclude', "Configure glob patterns for excluding files and folders in searches. Inherits all glob patterns from the files.exclude setting."),
			'default': { '**/node_modules': true, '**/bower_components': true },
			'additionalProperties': {
				'anyOf': [
					{
						'type': 'boolean',
						'description': nls.localize('exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
					},
					{
						'type': 'object',
						'properties': {
							'when': {
								'type': 'string', // expression ({ "**/*.js": { "when": "$(basename).js" } })
								'pattern': '\\w*\\$\\(basename\\)\\w*',
								'default': '$(basename).ext',
								'description': nls.localize('exclude.when', 'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.')
							}
						}
					}
				]
			}
		},
		'search.useRipgrep': {
			'type': 'boolean',
			'description': nls.localize('useRipgrep', "Controls whether to use ripgrep in text search"),
			'default': true
		},
		'search.useIgnoreFilesByDefault': {
			'type': 'boolean',
			'description': nls.localize('useIgnoreFilesByDefault', "Controls whether to use .gitignore and .ignore files by default when searching in a new workspace."),
			'default': false
		},
		'search.quickOpen.includeSymbols': {
			'type': 'boolean',
			'description': nls.localize('search.quickOpen.includeSymbols', "Configure to include results from a global symbol search in the file results for Quick Open."),
			'default': false
		}
	}
});
