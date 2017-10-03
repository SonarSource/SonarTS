/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { localize } from 'vs/nls';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import Event, { Emitter } from 'vs/base/common/event';
import { addDisposableListener, addClass } from 'vs/base/browser/dom';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { MenuRegistry } from 'vs/platform/actions/common/actions';
import { editorBackground, editorForeground } from 'vs/platform/theme/common/colorRegistry';
import { ITheme, LIGHT, DARK } from 'vs/platform/theme/common/themeService';

declare interface WebviewElement extends HTMLElement {
	src: string;
	autoSize: 'on';
	preload: string;
	contextIsolation: boolean;

	send(channel: string, ...args: any[]);
	openDevTools(): any;
}

CommandsRegistry.registerCommand('_webview.openDevTools', function () {
	const elements = document.querySelectorAll('webview.ready');
	for (let i = 0; i < elements.length; i++) {
		try {
			(<WebviewElement>elements.item(i)).openDevTools();
		} catch (e) {
			console.error(e);
		}
	}
});

MenuRegistry.addCommand({
	id: '_webview.openDevTools',
	title: localize('devtools.webview', "Developer: Webview Tools")
});

type ApiThemeClassName = 'vscode-light' | 'vscode-dark' | 'vscode-high-contrast';

export default class Webview {

	private _webview: WebviewElement;
	private _ready: TPromise<this>;
	private _disposables: IDisposable[];
	private _onDidClickLink = new Emitter<URI>();
	private _onDidLoadContent = new Emitter<{ stats: any }>();

	constructor(
		private parent: HTMLElement,
		private _styleElement: Element
	) {
		this._webview = <any>document.createElement('webview');

		this._webview.style.width = '100%';
		this._webview.style.height = '100%';
		this._webview.style.outline = '0';
		this._webview.style.opacity = '0';
		this._webview.contextIsolation = true;

		// disable auxclick events (see https://developers.google.com/web/updates/2016/10/auxclick)
		this._webview.setAttribute('disableblinkfeatures', 'Auxclick');

		this._webview.setAttribute('disableguestresize', '');

		this._webview.preload = require.toUrl('./webview-pre.js');
		this._webview.src = require.toUrl('./webview.html');

		this._ready = new TPromise<this>(resolve => {
			const subscription = addDisposableListener(this._webview, 'ipc-message', (event) => {
				if (event.channel === 'webview-ready') {
					// console.info('[PID Webview] ' + event.args[0]);
					addClass(this._webview, 'ready'); // can be found by debug command

					subscription.dispose();
					resolve(this);
				}
			});
		});

		this._disposables = [
			addDisposableListener(this._webview, 'console-message', function (e: { level: number; message: string; line: number; sourceId: string; }) {
				console.log(`[Embedded Page] ${e.message}`);
			}),
			addDisposableListener(this._webview, 'dom-ready', () => {
				this.layout();
			}),
			addDisposableListener(this._webview, 'crashed', function () {
				console.error('embedded page crashed');
			}),
			addDisposableListener(this._webview, 'ipc-message', (event) => {
				if (event.channel === 'did-click-link') {
					let [uri] = event.args;
					this._onDidClickLink.fire(URI.parse(uri));
					return;
				}

				if (event.channel === 'did-set-content') {
					this._webview.style.opacity = '';
					let [stats] = event.args;
					this._onDidLoadContent.fire({ stats });
					this.layout();
					return;
				}
			})
		];

		if (parent) {
			parent.appendChild(this._webview);
		}
	}

	dispose(): void {
		this._onDidClickLink.dispose();
		this._onDidLoadContent.dispose();
		this._disposables = dispose(this._disposables);

		if (this._webview.parentElement) {
			this._webview.parentElement.removeChild(this._webview);
		}
	}

	get onDidClickLink(): Event<URI> {
		return this._onDidClickLink.event;
	}

	get onDidLoadContent(): Event<{ stats: any }> {
		return this._onDidLoadContent.event;
	}

	private _send(channel: string, ...args: any[]): void {
		this._ready
			.then(() => this._webview.send(channel, ...args))
			.done(void 0, console.error);
	}

	set contents(value: string[]) {
		this._send('content', value);
	}

	set baseUrl(value: string) {
		this._send('baseUrl', value);
	}

	focus(): void {
		this._webview.focus();
		this._send('focus');
	}

	public sendMessage(data: any): void {
		this._send('message', data);
	}

	style(theme: ITheme): void {
		const { fontFamily, fontWeight, fontSize } = window.getComputedStyle(this._styleElement); // TODO@theme avoid styleElement

		let value = `
		:root {
			--background-color: ${theme.getColor(editorBackground)};
			--color: ${theme.getColor(editorForeground)};
			--font-family: ${fontFamily};
			--font-weight: ${fontWeight};
			--font-size: ${fontSize};
		}
		body {
			background-color: var(--background-color);
			color: var(--color);
			font-family: var(--font-family);
			font-weight: var(--font-weight);
			font-size: var(--font-size);
			margin: 0;
			padding: 0 20px;
		}

		img {
			max-width: 100%;
			max-height: 100%;
		}
		a:focus,
		input:focus,
		select:focus,
		textarea:focus {
			outline: 1px solid -webkit-focus-ring-color;
			outline-offset: -1px;
		}
		::-webkit-scrollbar {
			width: 10px;
			height: 10px;
		}`;


		let activeTheme: ApiThemeClassName;

		if (theme.type === LIGHT) {
			value += `
			::-webkit-scrollbar-thumb {
				background-color: rgba(100, 100, 100, 0.4);
			}
			::-webkit-scrollbar-thumb:hover {
				background-color: rgba(100, 100, 100, 0.7);
			}
			::-webkit-scrollbar-thumb:active {
				background-color: rgba(0, 0, 0, 0.6);
			}`;

			activeTheme = 'vscode-light';

		} else if (theme.type === DARK) {
			value += `
			::-webkit-scrollbar-thumb {
				background-color: rgba(121, 121, 121, 0.4);
			}
			::-webkit-scrollbar-thumb:hover {
				background-color: rgba(100, 100, 100, 0.7);
			}
			::-webkit-scrollbar-thumb:active {
				background-color: rgba(85, 85, 85, 0.8);
			}`;

			activeTheme = 'vscode-dark';

		} else {
			value += `
			::-webkit-scrollbar-thumb {
				background-color: rgba(111, 195, 223, 0.3);
			}
			::-webkit-scrollbar-thumb:hover {
				background-color: rgba(111, 195, 223, 0.8);
			}
			::-webkit-scrollbar-thumb:active {
				background-color: rgba(111, 195, 223, 0.8);
			}`;

			activeTheme = 'vscode-high-contrast';
		}

		this._send('styles', value, activeTheme);
	}

	public layout(): void {
		const contents = (this._webview as any).getWebContents();
		if (!contents) {
			return;
		}
		const window = contents.getOwnerBrowserWindow();
		if (!window || !window.webContents) {
			return;
		}
		window.webContents.getZoomFactor(factor => {
			if (contents.isDestroyed()) {
				return;
			}

			contents.setZoomFactor(factor);

			const width = this.parent.clientWidth;
			const height = this.parent.clientHeight;
			contents.setSize({
				normal: {
					width: Math.floor(width * factor),
					height: Math.floor(height * factor)
				}
			});
		});
	}
}
