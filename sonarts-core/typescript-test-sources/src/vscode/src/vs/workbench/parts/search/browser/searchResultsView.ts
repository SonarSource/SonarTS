/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import * as paths from 'vs/base/common/paths';
import * as DOM from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { FileLabel } from 'vs/workbench/browser/labels';
import { ITree, IDataSource, ISorter, IAccessibilityProvider, IFilter, IRenderer } from 'vs/base/parts/tree/browser/tree';
import { Match, SearchResult, FileMatch, FileMatchOrMatch, SearchModel } from 'vs/workbench/parts/search/common/searchModel';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { Range } from 'vs/editor/common/core/range';
import { SearchViewlet } from 'vs/workbench/parts/search/browser/searchViewlet';
import { RemoveAction, ReplaceAllAction, ReplaceAction } from 'vs/workbench/parts/search/browser/searchActions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachBadgeStyler } from "vs/platform/theme/common/styler";
import { IThemeService } from "vs/platform/theme/common/themeService";

export class SearchDataSource implements IDataSource {

	private static AUTOEXPAND_CHILD_LIMIT = 10;

	public getId(tree: ITree, element: any): string {
		if (element instanceof FileMatch) {
			return element.id();
		}

		if (element instanceof Match) {
			return element.id();
		}

		return 'root';
	}

	private _getChildren(element: any): any[] {
		if (element instanceof FileMatch) {
			return element.matches();
		} else if (element instanceof SearchResult) {
			return element.matches();
		}

		return [];
	}

	public getChildren(tree: ITree, element: any): TPromise<any[]> {
		return TPromise.as(this._getChildren(element));
	}

	public hasChildren(tree: ITree, element: any): boolean {
		return element instanceof FileMatch || element instanceof SearchResult;
	}

	public getParent(tree: ITree, element: any): TPromise<any> {
		let value: any = null;

		if (element instanceof Match) {
			value = element.parent();
		} else if (element instanceof FileMatch) {
			value = element.parent();
		}

		return TPromise.as(value);
	}

	public shouldAutoexpand(tree: ITree, element: any): boolean {
		const numChildren = this._getChildren(element).length;
		return numChildren > 0 && numChildren < SearchDataSource.AUTOEXPAND_CHILD_LIMIT;
	}
}

export class SearchSorter implements ISorter {

	public compare(tree: ITree, elementA: FileMatchOrMatch, elementB: FileMatchOrMatch): number {
		if (elementA instanceof FileMatch && elementB instanceof FileMatch) {
			return elementA.resource().fsPath.localeCompare(elementB.resource().fsPath) || elementA.name().localeCompare(elementB.name());
		}

		if (elementA instanceof Match && elementB instanceof Match) {
			return Range.compareRangesUsingStarts(elementA.range(), elementB.range());
		}

		return undefined;
	}
}

interface IFileMatchTemplate {
	label: FileLabel;
	badge: CountBadge;
	actions: ActionBar;
}

interface IMatchTemplate {
	parent: HTMLElement;
	before: HTMLElement;
	match: HTMLElement;
	replace: HTMLElement;
	after: HTMLElement;
	actions: ActionBar;
}

export class SearchRenderer extends Disposable implements IRenderer {

	private static FILE_MATCH_TEMPLATE_ID = 'fileMatch';
	private static MATCH_TEMPLATE_ID = 'match';

	constructor(
		actionRunner: IActionRunner,
		private viewlet: SearchViewlet,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IThemeService private themeService: IThemeService
	) {
		super();
	}

	public getHeight(tree: ITree, element: any): number {
		return 22;
	}

	public getTemplateId(tree: ITree, element: any): string {
		if (element instanceof FileMatch) {
			return SearchRenderer.FILE_MATCH_TEMPLATE_ID;
		} else if (element instanceof Match) {
			return SearchRenderer.MATCH_TEMPLATE_ID;
		}
		return null;
	}

	public renderTemplate(tree: ITree, templateId: string, container: HTMLElement): any {
		if (templateId === SearchRenderer.FILE_MATCH_TEMPLATE_ID) {
			return this.renderFileMatchTemplate(tree, templateId, container);
		}

		if (templateId === SearchRenderer.MATCH_TEMPLATE_ID) {
			return this.renderMatchTemplate(tree, templateId, container);
		}

		return null;
	}

	public renderElement(tree: ITree, element: any, templateId: string, templateData: any): void {
		if (SearchRenderer.FILE_MATCH_TEMPLATE_ID === templateId) {
			this.renderFileMatch(tree, <FileMatch>element, <IFileMatchTemplate>templateData);
		} else if (SearchRenderer.MATCH_TEMPLATE_ID === templateId) {
			this.renderMatch(tree, <Match>element, <IMatchTemplate>templateData);
		}
	}

	private renderFileMatchTemplate(tree: ITree, templateId: string, container: HTMLElement): IFileMatchTemplate {
		let fileMatchElement = DOM.append(container, DOM.$('.filematch'));
		const label = this.instantiationService.createInstance(FileLabel, fileMatchElement, void 0);
		const badge = new CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')));
		this._register(attachBadgeStyler(badge, this.themeService));
		const actions = new ActionBar(fileMatchElement, { animated: false });
		return { label, badge, actions };
	}

	private renderMatchTemplate(tree: ITree, templateId: string, container: HTMLElement): IMatchTemplate {
		DOM.addClass(container, 'linematch');

		const parent = DOM.append(container, DOM.$('a.plain.match'));
		const before = DOM.append(parent, DOM.$('span'));
		const match = DOM.append(parent, DOM.$('span.findInFileMatch'));
		const replace = DOM.append(parent, DOM.$('span.replaceMatch'));
		const after = DOM.append(parent, DOM.$('span'));
		const actions = new ActionBar(container, { animated: false });

		return {
			parent,
			before,
			match,
			replace,
			after,
			actions
		};
	}

	private renderFileMatch(tree: ITree, fileMatch: FileMatch, templateData: IFileMatchTemplate): void {
		templateData.label.setFile(fileMatch.resource());
		let count = fileMatch.count();
		templateData.badge.setCount(count);
		templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchMatches', "{0} matches found", count) : nls.localize('searchMatch', "{0} match found", count));

		let input = <SearchResult>tree.getInput();
		templateData.actions.clear();

		const actions: IAction[] = [];
		if (input.searchModel.isReplaceActive() && count > 0) {
			actions.push(this.instantiationService.createInstance(ReplaceAllAction, tree, fileMatch, this.viewlet));
		}
		actions.push(new RemoveAction(tree, fileMatch));
		templateData.actions.push(actions, { icon: true, label: false });
	}

	private renderMatch(tree: ITree, match: Match, templateData: IMatchTemplate): void {
		let preview = match.preview();
		const searchModel: SearchModel = (<SearchResult>tree.getInput()).searchModel;
		const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;

		templateData.before.textContent = preview.before;
		templateData.match.textContent = preview.inside;
		DOM.toggleClass(templateData.match, 'replace', replace);
		templateData.replace.textContent = replace ? match.replaceString : '';
		templateData.after.textContent = preview.after;
		templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);

		templateData.actions.clear();
		if (searchModel.isReplaceActive()) {
			templateData.actions.push([this.instantiationService.createInstance(ReplaceAction, tree, match, this.viewlet), new RemoveAction(tree, match)], { icon: true, label: false });
		} else {
			templateData.actions.push([new RemoveAction(tree, match)], { icon: true, label: false });
		}
	}

	public disposeTemplate(tree: ITree, templateId: string, templateData: any): void {
		if (SearchRenderer.FILE_MATCH_TEMPLATE_ID === templateId) {
			(<IFileMatchTemplate>templateData).label.dispose();
		}
	}
}

export class SearchAccessibilityProvider implements IAccessibilityProvider {

	constructor( @IWorkspaceContextService private contextService: IWorkspaceContextService) {
	}

	public getAriaLabel(tree: ITree, element: FileMatchOrMatch): string {
		if (element instanceof FileMatch) {
			const path = this.contextService.toWorkspaceRelativePath(element.resource()) || element.resource().fsPath;

			return nls.localize('fileMatchAriaLabel', "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
		}

		if (element instanceof Match) {
			const match = <Match>element;
			const searchModel: SearchModel = (<SearchResult>tree.getInput()).searchModel;
			const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
			const preview = match.preview();
			const range = match.range();
			if (replace) {
				return nls.localize('replacePreviewResultAria', "Replace term {0} with {1} at column position {2} in line with text {3}", preview.inside, match.replaceString, range.startColumn + 1, match.text());
			}
			return nls.localize('searchResultAria', "Found term {0} at column position {1} in line with text {2}", preview.inside, range.startColumn + 1, match.text());
		}
		return undefined;
	}
}

export class SearchFilter implements IFilter {

	public isVisible(tree: ITree, element: any): boolean {
		return !(element instanceof FileMatch) || element.matches().length > 0;
	}
}