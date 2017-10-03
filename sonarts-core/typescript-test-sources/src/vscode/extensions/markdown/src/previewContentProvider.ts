/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { MarkdownEngine } from './markdownEngine';

import * as nls from 'vscode-nls';
import { Logger } from "./logger";
const localize = nls.loadMessageBundle();

export interface ContentSecurityPolicyArbiter {
	isEnhancedSecurityDisableForWorkspace(rootPath: string): boolean;

	addTrustedWorkspace(rootPath: string): Thenable<void>;

	removeTrustedWorkspace(rootPath: string): Thenable<void>;
}

const previewStrings = {
	cspAlertMessageText: localize('preview.securityMessage.text', 'Scripts have been disabled in this document'),
	cspAlertMessageTitle: localize('preview.securityMessage.title', 'Scripts are disabled in the markdown preview. Change the Markdown preview secuirty setting to enable scripts'),
	cspAlertMessageLabel: localize('preview.securityMessage.label', 'Scripts Disabled Security Warning')
};

export function isMarkdownFile(document: vscode.TextDocument) {
	return document.languageId === 'markdown'
		&& document.uri.scheme !== 'markdown'; // prevent processing of own documents
}

export function getMarkdownUri(uri: vscode.Uri) {
	if (uri.scheme === 'markdown') {
		return uri;
	}

	return uri.with({
		scheme: 'markdown',
		path: uri.fsPath + '.rendered',
		query: uri.toString()
	});
}

class MarkdownPreviewConfig {
	public static getCurrentConfig() {
		return new MarkdownPreviewConfig();
	}

	public readonly scrollBeyondLastLine: boolean;
	public readonly wordWrap: boolean;
	public readonly previewFrontMatter: string;
	public readonly doubleClickToSwitchToEditor: boolean;
	public readonly scrollEditorWithPreview: boolean;
	public readonly scrollPreviewWithEditorSelection: boolean;
	public readonly markEditorSelection: boolean;

	public readonly lineHeight: number;
	public readonly fontSize: number;
	public readonly fontFamily: string | undefined;
	public readonly styles: string[];

	private constructor() {
		const editorConfig = vscode.workspace.getConfiguration('editor');
		const markdownConfig = vscode.workspace.getConfiguration('markdown');

		this.scrollBeyondLastLine = editorConfig.get<boolean>('scrollBeyondLastLine', false);
		this.wordWrap = editorConfig.get<string>('wordWrap', 'off') !== 'off';

		this.previewFrontMatter = markdownConfig.get<string>('previewFrontMatter', 'hide');
		this.scrollPreviewWithEditorSelection = !!markdownConfig.get<boolean>('preview.scrollPreviewWithEditorSelection', true);
		this.scrollEditorWithPreview = !!markdownConfig.get<boolean>('preview.scrollEditorWithPreview', true);
		this.doubleClickToSwitchToEditor = !!markdownConfig.get<boolean>('preview.doubleClickToSwitchToEditor', true);
		this.markEditorSelection = !!markdownConfig.get<boolean>('preview.markEditorSelection', true);

		this.fontFamily = markdownConfig.get<string | undefined>('preview.fontFamily', undefined);
		this.fontSize = +markdownConfig.get<number>('preview.fontSize', NaN);
		this.lineHeight = +markdownConfig.get<number>('preview.lineHeight', NaN);

		this.styles = markdownConfig.get<string[]>('styles', []);
	}

	public isEqualTo(otherConfig: MarkdownPreviewConfig) {
		for (let key in this) {
			if (this.hasOwnProperty(key) && key !== 'styles') {
				if (this[key] !== otherConfig[key]) {
					return false;
				}
			}
		}

		// Check styles
		if (this.styles.length !== otherConfig.styles.length) {
			return false;
		}
		for (let i = 0; i < this.styles.length; ++i) {
			if (this.styles[i] !== otherConfig.styles[i]) {
				return false;
			}
		}

		return true;
	}

	[key: string]: any;
}

export class MDDocumentContentProvider implements vscode.TextDocumentContentProvider {
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _waiting: boolean = false;

	private config: MarkdownPreviewConfig;

	private extraStyles: Array<vscode.Uri> = [];
	private extraScripts: Array<vscode.Uri> = [];

	constructor(
		private engine: MarkdownEngine,
		private context: vscode.ExtensionContext,
		private cspArbiter: ContentSecurityPolicyArbiter,
		private logger: Logger
	) {
		this.config = MarkdownPreviewConfig.getCurrentConfig();
	}

	public addScript(resource: vscode.Uri): void {
		this.extraScripts.push(resource);
	}

	public addStyle(resource: vscode.Uri): void {
		this.extraStyles.push(resource);
	}

	private getMediaPath(mediaFile: string): string {
		return vscode.Uri.file(this.context.asAbsolutePath(path.join('media', mediaFile))).toString();
	}

	private fixHref(resource: vscode.Uri, href: string): string {
		if (!href) {
			return href;
		}

		// Use href if it is already an URL
		const hrefUri = vscode.Uri.parse(href);
		if (['file', 'http', 'https'].indexOf(hrefUri.scheme) >= 0) {
			return hrefUri.toString();
		}

		// Use href as file URI if it is absolute
		if (path.isAbsolute(href)) {
			return vscode.Uri.file(href).toString();
		}

		// use a workspace relative path if there is a workspace
		let rootPath = vscode.workspace.rootPath;
		if (rootPath) {
			return vscode.Uri.file(path.join(rootPath, href)).toString();
		}

		// otherwise look relative to the markdown file
		return vscode.Uri.file(path.join(path.dirname(resource.fsPath), href)).toString();
	}

	private computeCustomStyleSheetIncludes(uri: vscode.Uri): string {
		if (this.config.styles && Array.isArray(this.config.styles)) {
			return this.config.styles.map((style) => {
				return `<link rel="stylesheet" href="${this.fixHref(uri, style)}" type="text/css" media="screen">`;
			}).join('\n');
		}
		return '';
	}

	private getSettingsOverrideStyles(nonce: string): string {
		return `<style nonce="${nonce}">
			body {
				${this.config.fontFamily ? `font-family: ${this.config.fontFamily};` : ''}
				${this.config.fontSize > 0 ? `font-size: ${this.config.fontSize}px;` : ''}
				${this.config.lineHeight > 0 ? `line-height: ${this.config.lineHeight};` : ''}
			}
		</style>`;
	}

	private getStyles(uri: vscode.Uri, nonce: string): string {
		const baseStyles = [
			this.getMediaPath('markdown.css'),
			this.getMediaPath('tomorrow.css')
		].concat(this.extraStyles.map(resource => resource.toString()));

		return `${baseStyles.map(href => `<link rel="stylesheet" type="text/css" href="${href}">`).join('\n')}
			${this.getSettingsOverrideStyles(nonce)}
			${this.computeCustomStyleSheetIncludes(uri)}`;
	}

	private getScripts(nonce: string): string {
		const scripts = [this.getMediaPath('main.js')].concat(this.extraScripts.map(resource => resource.toString()));
		return scripts
			.map(source => `<script src="${source}" nonce="${nonce}"></script>`)
			.join('\n');
	}

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		const sourceUri = vscode.Uri.parse(uri.query);

		return vscode.workspace.openTextDocument(sourceUri).then(document => {
			this.config = MarkdownPreviewConfig.getCurrentConfig();

			let initialLine = 0;
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.uri.fsPath === sourceUri.fsPath) {
				initialLine = editor.selection.active.line;
			}

			const initialData = {
				previewUri: uri.toString(),
				source: sourceUri.toString(),
				line: initialLine,
				scrollPreviewWithEditorSelection: this.config.scrollPreviewWithEditorSelection,
				scrollEditorWithPreview: this.config.scrollEditorWithPreview,
				doubleClickToSwitchToEditor: this.config.doubleClickToSwitchToEditor
			};

			this.logger.log('provideTextDocumentContent', initialData);

			// Content Security Policy
			const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
			let csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' http: https: data:; media-src 'self' http: https: data:; child-src 'none'; script-src 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' http: https: data:; font-src 'self' http: https: data:;">`;
			if (this.cspArbiter.isEnhancedSecurityDisableForWorkspace(vscode.workspace.rootPath || sourceUri.toString())) {
				csp = '';
			}

			const body = this.engine.render(sourceUri, this.config.previewFrontMatter === 'hide', document.getText());
			return `<!DOCTYPE html>
				<html>
				<head>
					<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
					${csp}
					<meta id="vscode-markdown-preview-data" data-settings="${JSON.stringify(initialData).replace(/"/g, '&quot;')}" data-strings="${JSON.stringify(previewStrings).replace(/"/g, '&quot;')}">
					<script src="${this.getMediaPath('csp.js')}" nonce="${nonce}"></script>
					${this.getStyles(uri, nonce)}
					<base href="${document.uri.toString(true)}">
				</head>
				<body class="vscode-body ${this.config.scrollBeyondLastLine ? 'scrollBeyondLastLine' : ''} ${this.config.wordWrap ? 'wordWrap' : ''} ${this.config.markEditorSelection ? 'showEditorSelection' : ''}">
					${body}
					<div class="code-line" data-line="${document.lineCount}"></div>
					${this.getScripts(nonce)}
				</body>
				</html>`;
		});
	}

	public updateConfiguration() {
		const newConfig = MarkdownPreviewConfig.getCurrentConfig();
		if (!this.config.isEqualTo(newConfig)) {
			this.config = newConfig;
			// update all generated md documents
			vscode.workspace.textDocuments.forEach(document => {
				if (document.uri.scheme === 'markdown') {
					this.update(document.uri);
				}
			});
		}
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}

	public update(uri: vscode.Uri) {
		if (!this._waiting) {
			this._waiting = true;
			setTimeout(() => {
				this._waiting = false;
				this._onDidChange.fire(uri);
			}, 300);
		}
	}
}
