/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./media/extensionEditor';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { marked } from 'vs/base/common/marked/marked';
import { always } from 'vs/base/common/async';
import * as arrays from 'vs/base/common/arrays';
import { OS } from 'vs/base/common/platform';
import Event, { Emitter, once, fromEventEmitter, chain } from 'vs/base/common/event';
import Cache from 'vs/base/common/cache';
import { Action } from 'vs/base/common/actions';
import { isPromiseCanceledError } from 'vs/base/common/errors';
import Severity from 'vs/base/common/severity';
import { IDisposable, empty, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { Builder } from 'vs/base/browser/builder';
import { domEvent } from 'vs/base/browser/event';
import { append, $, addClass, removeClass, finalHandler, join } from 'vs/base/browser/dom';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { IViewletService } from 'vs/workbench/services/viewlet/browser/viewlet';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionGalleryService, IExtensionManifest, IKeyBinding } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ResolvedKeybinding } from 'vs/base/common/keyCodes';
import { ExtensionsInput } from 'vs/workbench/parts/extensions/common/extensionsInput';
import { IExtensionsWorkbenchService, IExtensionsViewlet, VIEWLET_ID, IExtension, IExtensionDependencies } from 'vs/workbench/parts/extensions/common/extensions';
import { Renderer, DataSource, Controller } from 'vs/workbench/parts/extensions/browser/dependenciesViewer';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITemplateData } from 'vs/workbench/parts/extensions/browser/extensionsList';
import { RatingsWidget, InstallWidget } from 'vs/workbench/parts/extensions/browser/extensionsWidgets';
import { EditorOptions } from 'vs/workbench/common/editor';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { CombinedInstallAction, UpdateAction, EnableAction, DisableAction, BuiltinStatusLabelAction, ReloadAction } from 'vs/workbench/parts/extensions/browser/extensionsActions';
import WebView from 'vs/workbench/parts/html/browser/webview';
import { KeybindingIO } from 'vs/workbench/services/keybinding/common/keybindingIO';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { IMessageService } from 'vs/platform/message/common/message';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { Tree } from 'vs/base/parts/tree/browser/treeImpl';
import { Position } from 'vs/platform/editor/common/editor';
import { IListService } from 'vs/platform/list/browser/listService';
import { IPartService, Parts } from 'vs/workbench/services/part/common/partService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { KeybindingLabel } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { attachListStyler } from 'vs/platform/theme/common/styler';

function renderBody(body: string): string {
	const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
	return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src http: https: data:; media-src http: https: data:; script-src 'none'; style-src 'nonce-${nonce}'; child-src 'none'; frame-src 'none';">
				<link rel="stylesheet" type="text/css" href="${require.toUrl('./media/markdown.css')}" nonce="${nonce}" >
			</head>
			<body>${body}</body>
		</html>`;
}

class NavBar {

	private _onChange = new Emitter<string>();
	get onChange(): Event<string> { return this._onChange.event; }

	private currentId: string = null;
	private actions: Action[];
	private actionbar: ActionBar;

	constructor(container: HTMLElement) {
		const element = append(container, $('.navbar'));
		this.actions = [];
		this.actionbar = new ActionBar(element, { animated: false });
	}

	push(id: string, label: string): void {
		const run = () => this._update(id);
		const action = new Action(id, label, null, true, run);

		this.actions.push(action);
		this.actionbar.push(action);

		if (this.actions.length === 1) {
			run();
		}
	}

	clear(): void {
		this.actions = dispose(this.actions);
		this.actionbar.clear();
	}

	update(): void {
		this._update(this.currentId);
	}

	_update(id: string = this.currentId): TPromise<void> {
		this.currentId = id;
		this._onChange.fire(id);
		this.actions.forEach(a => a.enabled = a.id !== id);
		return TPromise.as(null);
	}

	dispose(): void {
		this.actionbar = dispose(this.actionbar);
	}
}

const NavbarSection = {
	Readme: 'readme',
	Contributions: 'contributions',
	Changelog: 'changelog',
	Dependencies: 'dependencies'
};

interface ILayoutParticipant {
	layout(): void;
}

export class ExtensionEditor extends BaseEditor {

	static ID: string = 'workbench.editor.extension';

	private icon: HTMLImageElement;
	private name: HTMLElement;
	private identifier: HTMLElement;
	private license: HTMLElement;
	private publisher: HTMLElement;
	private installCount: HTMLElement;
	private rating: HTMLElement;
	private description: HTMLElement;
	private extensionActionBar: ActionBar;
	private navbar: NavBar;
	private content: HTMLElement;

	private _highlight: ITemplateData;
	private highlightDisposable: IDisposable;

	private extensionReadme: Cache<string>;
	private extensionChangelog: Cache<string>;
	private extensionManifest: Cache<IExtensionManifest>;
	private extensionDependencies: Cache<IExtensionDependencies>;

	private layoutParticipants: ILayoutParticipant[] = [];
	private contentDisposables: IDisposable[] = [];
	private transientDisposables: IDisposable[] = [];
	private disposables: IDisposable[];

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IExtensionGalleryService private galleryService: IExtensionGalleryService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IViewletService private viewletService: IViewletService,
		@IExtensionsWorkbenchService private extensionsWorkbenchService: IExtensionsWorkbenchService,
		@IThemeService protected themeService: IThemeService,
		@IKeybindingService private keybindingService: IKeybindingService,
		@IMessageService private messageService: IMessageService,
		@IOpenerService private openerService: IOpenerService,
		@IListService private listService: IListService,
		@IPartService private partService: IPartService
	) {
		super(ExtensionEditor.ID, telemetryService, themeService);
		this._highlight = null;
		this.highlightDisposable = empty;
		this.disposables = [];
		this.extensionReadme = null;
		this.extensionChangelog = null;
		this.extensionManifest = null;
		this.extensionDependencies = null;
	}

	createEditor(parent: Builder): void {
		const container = parent.getHTMLElement();

		const root = append(container, $('.extension-editor'));
		const header = append(root, $('.header'));

		this.icon = append(header, $<HTMLImageElement>('img.icon', { draggable: false }));

		const details = append(header, $('.details'));
		const title = append(details, $('.title'));
		this.name = append(title, $('span.name.clickable', { title: localize('name', "Extension name") }));
		this.identifier = append(title, $('span.identifier', { title: localize('extension id', "Extension identifier") }));

		const subtitle = append(details, $('.subtitle'));
		this.publisher = append(subtitle, $('span.publisher.clickable', { title: localize('publisher', "Publisher name") }));

		this.installCount = append(subtitle, $('span.install', { title: localize('install count', "Install count") }));

		this.rating = append(subtitle, $('span.rating.clickable', { title: localize('rating', "Rating") }));

		this.license = append(subtitle, $('span.license.clickable'));
		this.license.textContent = localize('license', 'License');
		this.license.style.display = 'none';

		this.description = append(details, $('.description'));

		const extensionActions = append(details, $('.actions'));
		this.extensionActionBar = new ActionBar(extensionActions, {
			animated: false,
			actionItemProvider: (action: Action) => {
				if (action.id === EnableAction.ID) {
					return (<EnableAction>action).actionItem;
				}
				if (action.id === DisableAction.ID) {
					return (<DisableAction>action).actionItem;
				}
				return null;
			}
		});
		this.disposables.push(this.extensionActionBar);

		chain(fromEventEmitter<{ error?: any; }>(this.extensionActionBar, 'run'))
			.map(({ error }) => error)
			.filter(error => !!error)
			.on(this.onError, this, this.disposables);

		const body = append(root, $('.body'));
		this.navbar = new NavBar(body);

		this.content = append(body, $('.content'));
	}

	setInput(input: ExtensionsInput, options: EditorOptions): TPromise<void> {
		const extension = input.extension;

		this.transientDisposables = dispose(this.transientDisposables);

		this.telemetryService.publicLog('extensionGallery:openExtension', extension.telemetryData);

		this.extensionReadme = new Cache(() => extension.getReadme());
		this.extensionChangelog = new Cache(() => extension.getChangelog());
		this.extensionManifest = new Cache(() => extension.getManifest());
		this.extensionDependencies = new Cache(() => this.extensionsWorkbenchService.loadDependencies(extension));

		const onError = once(domEvent(this.icon, 'error'));
		onError(() => this.icon.src = extension.iconUrlFallback, null, this.transientDisposables);
		this.icon.src = extension.iconUrl;

		this.name.textContent = extension.displayName;
		this.identifier.textContent = extension.id;

		this.publisher.textContent = extension.publisherDisplayName;
		this.description.textContent = extension.description;

		if (extension.url) {
			this.name.onclick = finalHandler(() => window.open(extension.url));
			this.rating.onclick = finalHandler(() => window.open(`${extension.url}#review-details`));
			this.publisher.onclick = finalHandler(() => {
				this.viewletService.openViewlet(VIEWLET_ID, true)
					.then(viewlet => viewlet as IExtensionsViewlet)
					.done(viewlet => viewlet.search(`publisher:"${extension.publisherDisplayName}"`));
			});

			if (extension.licenseUrl) {
				this.license.onclick = finalHandler(() => window.open(extension.licenseUrl));
				this.license.style.display = 'initial';
			} else {
				this.license.onclick = null;
				this.license.style.display = 'none';
			}
		}

		const install = this.instantiationService.createInstance(InstallWidget, this.installCount, { extension });
		this.transientDisposables.push(install);

		const ratings = this.instantiationService.createInstance(RatingsWidget, this.rating, { extension });
		this.transientDisposables.push(ratings);

		const builtinStatusAction = this.instantiationService.createInstance(BuiltinStatusLabelAction);
		const installAction = this.instantiationService.createInstance(CombinedInstallAction);
		const updateAction = this.instantiationService.createInstance(UpdateAction);
		const enableAction = this.instantiationService.createInstance(EnableAction);
		const disableAction = this.instantiationService.createInstance(DisableAction);
		const reloadAction = this.instantiationService.createInstance(ReloadAction);

		installAction.extension = extension;
		builtinStatusAction.extension = extension;
		updateAction.extension = extension;
		enableAction.extension = extension;
		disableAction.extension = extension;
		reloadAction.extension = extension;

		this.extensionActionBar.clear();
		this.extensionActionBar.push([reloadAction, updateAction, enableAction, disableAction, installAction, builtinStatusAction], { icon: true, label: true });
		this.transientDisposables.push(enableAction, updateAction, reloadAction, disableAction, installAction, builtinStatusAction);

		this.navbar.clear();
		this.navbar.onChange(this.onNavbarChange.bind(this, extension), this, this.transientDisposables);
		this.navbar.push(NavbarSection.Readme, localize('details', "Details"));
		this.navbar.push(NavbarSection.Contributions, localize('contributions', "Contributions"));
		this.navbar.push(NavbarSection.Changelog, localize('changelog', "Changelog"));
		this.navbar.push(NavbarSection.Dependencies, localize('dependencies', "Dependencies"));

		this.content.innerHTML = '';

		return super.setInput(input, options);
	}

	changePosition(position: Position): void {
		this.navbar.update();
		super.changePosition(position);
	}

	private onNavbarChange(extension: IExtension, id: string): void {
		this.contentDisposables = dispose(this.contentDisposables);
		this.content.innerHTML = '';
		switch (id) {
			case NavbarSection.Readme: return this.openReadme();
			case NavbarSection.Contributions: return this.openContributions();
			case NavbarSection.Changelog: return this.openChangelog();
			case NavbarSection.Dependencies: return this.openDependencies(extension);
		}
	}

	private openMarkdown(content: TPromise<string>, noContentCopy: string) {
		return this.loadContents(() => content
			.then(marked.parse)
			.then(renderBody)
			.then<void>(body => {
				const webview = new WebView(this.content, this.partService.getContainer(Parts.EDITOR_PART));
				const removeLayoutParticipant = arrays.insert(this.layoutParticipants, webview);
				this.contentDisposables.push(toDisposable(removeLayoutParticipant));

				webview.style(this.themeService.getTheme());
				webview.contents = [body];

				webview.onDidClickLink(link => {
					// Whitelist supported schemes for links
					if (link && ['http', 'https', 'mailto'].indexOf(link.scheme) >= 0) {
						this.openerService.open(link);
					}
				}, null, this.contentDisposables);
				this.themeService.onThemeChange(theme => webview.style(theme), null, this.contentDisposables);
				this.contentDisposables.push(webview);
			})
			.then(null, () => {
				const p = append(this.content, $('p.nocontent'));
				p.textContent = noContentCopy;
			}));
	}

	private openReadme() {
		return this.openMarkdown(this.extensionReadme.get(), localize('noReadme', "No README available."));
	}

	private openChangelog() {
		return this.openMarkdown(this.extensionChangelog.get(), localize('noChangelog', "No Changelog available."));
	}

	private openContributions() {
		return this.loadContents(() => this.extensionManifest.get()
			.then(manifest => {
				const content = $('div', { class: 'subcontent' });
				const scrollableContent = new DomScrollableElement(content, { canUseTranslate3d: false });

				const layout = () => scrollableContent.scanDomNode();
				const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
				this.contentDisposables.push(toDisposable(removeLayoutParticipant));

				const renders = [
					this.renderSettings(content, manifest, layout),
					this.renderCommands(content, manifest, layout),
					this.renderLanguages(content, manifest, layout),
					this.renderThemes(content, manifest, layout),
					this.renderJSONValidation(content, manifest, layout),
					this.renderDebuggers(content, manifest, layout)
				];

				const isEmpty = !renders.reduce((v, r) => r || v, false);
				scrollableContent.scanDomNode();

				if (isEmpty) {
					append(this.content, $('p.nocontent')).textContent = localize('noContributions', "No Contributions");
					return;
				} else {
					append(this.content, scrollableContent.getDomNode());
					this.contentDisposables.push(scrollableContent);
				}
			}));
	}

	private openDependencies(extension: IExtension) {
		if (extension.dependencies.length === 0) {
			append(this.content, $('p.nocontent')).textContent = localize('noDependencies', "No Dependencies");
			return;
		}

		return this.loadContents(() => {
			return this.extensionDependencies.get().then(extensionDependencies => {
				const content = $('div', { class: 'subcontent' });
				const scrollableContent = new DomScrollableElement(content, { canUseTranslate3d: false });
				append(this.content, scrollableContent.getDomNode());
				this.contentDisposables.push(scrollableContent);

				const tree = this.renderDependencies(content, extensionDependencies);
				const layout = () => {
					scrollableContent.scanDomNode();
					const scrollState = scrollableContent.getScrollState();
					tree.layout(scrollState.height);
				};
				const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
				this.contentDisposables.push(toDisposable(removeLayoutParticipant));

				this.contentDisposables.push(tree);
				scrollableContent.scanDomNode();
			}, error => {
				append(this.content, $('p.nocontent')).textContent = error;
				this.messageService.show(Severity.Error, error);
			});
		});
	}

	private renderDependencies(container: HTMLElement, extensionDependencies: IExtensionDependencies): Tree {
		const renderer = this.instantiationService.createInstance(Renderer);
		const controller = this.instantiationService.createInstance(Controller);
		const tree = new Tree(container, {
			dataSource: new DataSource(),
			renderer,
			controller
		}, {
				indentPixels: 40,
				twistiePixels: 20,
				keyboardSupport: false
			});

		this.contentDisposables.push(attachListStyler(tree, this.themeService));

		tree.setInput(extensionDependencies);

		this.contentDisposables.push(tree.addListener('selection', event => {
			if (event && event.payload && event.payload.origin === 'keyboard') {
				controller.openExtension(tree, false);
			}
		}));

		this.contentDisposables.push(this.listService.register(tree));

		return tree;
	}

	private renderSettings(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const configuration = contributes && contributes.configuration;
		const properties = configuration && configuration.properties;
		const contrib = properties ? Object.keys(properties) : [];

		if (!contrib.length) {
			return false;
		}

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('settings', "Settings ({0})", contrib.length)),
			$('table', null,
				$('tr', null,
					$('th', null, localize('setting name', "Name")),
					$('th', null, localize('description', "Description")),
					$('th', null, localize('default', "Default"))
				),
				...contrib.map(key => $('tr', null,
					$('td', null, $('code', null, key)),
					$('td', null, properties[key].description),
					$('td', null, $('code', null, properties[key].default))
				))
			)
		);

		append(container, details);
		return true;
	}

	private renderDebuggers(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const contrib = contributes && contributes.debuggers || [];

		if (!contrib.length) {
			return false;
		}

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('debuggers', "Debuggers ({0})", contrib.length)),
			$('table', null,
				$('tr', null, $('th', null, localize('debugger name', "Name"))),
				...contrib.map(d => $('tr', null, $('td', null, d.label || d.type)))
			)
		);

		append(container, details);
		return true;
	}

	private renderThemes(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const contrib = contributes && contributes.themes || [];

		if (!contrib.length) {
			return false;
		}

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('themes', "Themes ({0})", contrib.length)),
			$('ul', null, ...contrib.map(theme => $('li', null, theme.label)))
		);

		append(container, details);
		return true;
	}

	private renderJSONValidation(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const contrib = contributes && contributes.jsonValidation || [];

		if (!contrib.length) {
			return false;
		}

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('JSON Validation', "JSON Validation ({0})", contrib.length)),
			$('ul', null, ...contrib.map(v => $('li', null, v.fileMatch)))
		);

		append(container, details);
		return true;
	}

	private renderCommands(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const rawCommands = contributes && contributes.commands || [];
		const commands = rawCommands.map(c => ({
			id: c.command,
			title: c.title,
			keybindings: [],
			menus: []
		}));

		const byId = arrays.index(commands, c => c.id);

		const menus = contributes && contributes.menus || {};

		Object.keys(menus).forEach(context => {
			menus[context].forEach(menu => {
				let command = byId[menu.command];

				if (!command) {
					command = { id: menu.command, title: '', keybindings: [], menus: [context] };
					byId[command.id] = command;
					commands.push(command);
				} else {
					command.menus.push(context);
				}
			});
		});

		const rawKeybindings = contributes && contributes.keybindings || [];

		rawKeybindings.forEach(rawKeybinding => {
			const keybinding = this.resolveKeybinding(rawKeybinding);

			if (!keybinding) {
				return;
			}

			let command = byId[rawKeybinding.command];

			if (!command) {
				command = { id: rawKeybinding.command, title: '', keybindings: [keybinding], menus: [] };
				byId[command.id] = command;
				commands.push(command);
			} else {
				command.keybindings.push(keybinding);
			}
		});

		if (!commands.length) {
			return false;
		}

		const renderKeybinding = (keybinding: ResolvedKeybinding): HTMLElement => {
			const element = $('');
			new KeybindingLabel(element, OS).set(keybinding, null);
			return element;
		};

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('commands', "Commands ({0})", commands.length)),
			$('table', null,
				$('tr', null,
					$('th', null, localize('command name', "Name")),
					$('th', null, localize('description', "Description")),
					$('th', null, localize('keyboard shortcuts', "Keyboard Shortcuts")),
					$('th', null, localize('menuContexts', "Menu Contexts"))
				),
				...commands.map(c => $('tr', null,
					$('td', null, $('code', null, c.id)),
					$('td', null, c.title),
					$('td', null, ...c.keybindings.map(keybinding => renderKeybinding(keybinding))),
					$('td', null, ...c.menus.map(context => $('code', null, context)))
				))
			)
		);

		append(container, details);
		return true;
	}

	private renderLanguages(container: HTMLElement, manifest: IExtensionManifest, onDetailsToggle: Function): boolean {
		const contributes = manifest.contributes;
		const rawLanguages = contributes && contributes.languages || [];
		const languages = rawLanguages.map(l => ({
			id: l.id,
			name: (l.aliases || [])[0] || l.id,
			extensions: l.extensions || [],
			hasGrammar: false,
			hasSnippets: false
		}));

		const byId = arrays.index(languages, l => l.id);

		const grammars = contributes && contributes.grammars || [];

		grammars.forEach(grammar => {
			let language = byId[grammar.language];

			if (!language) {
				language = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
				byId[language.id] = language;
				languages.push(language);
			} else {
				language.hasGrammar = true;
			}
		});

		const snippets = contributes && contributes.snippets || [];

		snippets.forEach(snippet => {
			let language = byId[snippet.language];

			if (!language) {
				language = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
				byId[language.id] = language;
				languages.push(language);
			} else {
				language.hasSnippets = true;
			}
		});

		if (!languages.length) {
			return false;
		}

		const details = $('details', { open: true, ontoggle: onDetailsToggle },
			$('summary', null, localize('languages', "Languages ({0})", languages.length)),
			$('table', null,
				$('tr', null,
					$('th', null, localize('language id', "ID")),
					$('th', null, localize('language name', "Name")),
					$('th', null, localize('file extensions', "File Extensions")),
					$('th', null, localize('grammar', "Grammar")),
					$('th', null, localize('snippets', "Snippets"))
				),
				...languages.map(l => $('tr', null,
					$('td', null, l.id),
					$('td', null, l.name),
					$('td', null, ...join(l.extensions.map(ext => $('code', null, ext)), ' ')),
					$('td', null, document.createTextNode(l.hasGrammar ? '✔︎' : '—')),
					$('td', null, document.createTextNode(l.hasSnippets ? '✔︎' : '—'))
				))
			)
		);

		append(container, details);
		return true;
	}

	private resolveKeybinding(rawKeyBinding: IKeyBinding): ResolvedKeybinding {
		let key: string;

		switch (process.platform) {
			case 'win32': key = rawKeyBinding.win; break;
			case 'linux': key = rawKeyBinding.linux; break;
			case 'darwin': key = rawKeyBinding.mac; break;
		}

		const keyBinding = KeybindingIO.readKeybinding(key || rawKeyBinding.key, OS);
		return this.keybindingService.resolveKeybinding(keyBinding)[0];
	}

	private loadContents(loadingTask: () => TPromise<any>): void {
		addClass(this.content, 'loading');

		let promise = loadingTask();
		promise = always(promise, () => removeClass(this.content, 'loading'));

		this.contentDisposables.push(toDisposable(() => promise.cancel()));
	}

	layout(): void {
		this.layoutParticipants.forEach(p => p.layout());
	}

	private onError(err: any): void {
		if (isPromiseCanceledError(err)) {
			return;
		}

		this.messageService.show(Severity.Error, err);
	}

	dispose(): void {
		this._highlight = null;
		this.transientDisposables = dispose(this.transientDisposables);
		this.disposables = dispose(this.disposables);
		super.dispose();
	}
}
