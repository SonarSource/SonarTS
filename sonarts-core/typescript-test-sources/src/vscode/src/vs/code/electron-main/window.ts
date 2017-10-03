/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as path from 'path';
import * as platform from 'vs/base/common/platform';
import * as objects from 'vs/base/common/objects';
import { stopProfiling } from 'vs/base/node/profiler';
import nls = require('vs/nls');
import { IStorageService } from 'vs/code/electron-main/storage';
import { shell, screen, BrowserWindow, systemPreferences, app } from 'electron';
import { TPromise, TValueCallback } from 'vs/base/common/winjs.base';
import { IEnvironmentService, ParsedArgs } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/code/electron-main/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchEditorConfiguration } from 'vs/workbench/common/editor';
import { parseArgs } from 'vs/platform/environment/node/argv';
import product from 'vs/platform/node/product';
import { getCommonHTTPHeaders } from 'vs/platform/environment/node/http';
import { IWindowSettings, MenuBarVisibility } from 'vs/platform/windows/common/windows';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';


export interface IWindowState {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	mode?: WindowMode;
	display?: number;
}

export interface IWindowCreationOptions {
	state: IWindowState;
	extensionDevelopmentPath?: string;
	isExtensionTestHost?: boolean;
}

export enum WindowMode {
	Maximized,
	Normal,
	Minimized, // not used anymore, but also cannot remove due to existing stored UI state (needs migration)
	Fullscreen
}

export const defaultWindowState = function (mode = WindowMode.Normal): IWindowState {
	return {
		width: 1024,
		height: 768,
		mode
	};
};

export interface IPath {

	// the workspace spath for a VSCode instance which can be null
	workspacePath?: string;

	// the file path to open within a VSCode instance
	filePath?: string;

	// the line number in the file path to open
	lineNumber?: number;

	// the column number in the file path to open
	columnNumber?: number;

	// indicator to create the file path in the VSCode instance
	createFilePath?: boolean;
}

export interface IWindowConfiguration extends ParsedArgs {
	appRoot: string;
	execPath: string;

	userEnv: platform.IProcessEnvironment;

	/**
	 * The physical keyboard is of ISO type (on OSX)
	 */
	isISOKeyboard?: boolean;
	zoomLevel?: number;
	fullscreen?: boolean;
	highContrast?: boolean;
	baseTheme?: string;
	backgroundColor?: string;
	accessibilitySupport?: boolean;

	isInitialStartup?: boolean;

	perfStartTime?: number;
	perfAppReady?: number;
	perfWindowLoadTime?: number;

	workspacePath?: string;

	filesToOpen?: IPath[];
	filesToCreate?: IPath[];
	filesToDiff?: IPath[];

	nodeCachedDataDir: string;
}

export enum ReadyState {

	/**
	 * This window has not loaded any HTML yet
	 */
	NONE,

	/**
	 * This window is loading HTML
	 */
	LOADING,

	/**
	 * This window is navigating to another HTML
	 */
	NAVIGATING,

	/**
	 * This window is done loading HTML
	 */
	READY
}

interface IConfiguration {
	window: {
		menuBarVisibility: MenuBarVisibility;
	};
}

export class VSCodeWindow {

	public static themeStorageKey = 'theme';
	public static themeBackgroundStorageKey = 'themeBackground';

	private static MIN_WIDTH = 200;
	private static MIN_HEIGHT = 120;

	private options: IWindowCreationOptions;
	private hiddenTitleBarStyle: boolean;
	private showTimeoutHandle: any;
	private _id: number;
	private _win: Electron.BrowserWindow;
	private _lastFocusTime: number;
	private _readyState: ReadyState;
	private _extensionDevelopmentPath: string;
	private _isExtensionTestHost: boolean;
	private windowState: IWindowState;
	private currentMenuBarVisibility: MenuBarVisibility;
	private currentWindowMode: WindowMode;
	private toDispose: IDisposable[];

	private whenReadyCallbacks: TValueCallback<VSCodeWindow>[];

	private currentConfig: IWindowConfiguration;
	private pendingLoadConfig: IWindowConfiguration;

	constructor(
		config: IWindowCreationOptions,
		@ILogService private logService: ILogService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IStorageService private storageService: IStorageService
	) {
		this.options = config;
		this._lastFocusTime = -1;
		this._readyState = ReadyState.NONE;
		this._extensionDevelopmentPath = config.extensionDevelopmentPath;
		this._isExtensionTestHost = config.isExtensionTestHost;
		this.whenReadyCallbacks = [];
		this.toDispose = [];

		// Load window state
		this.restoreWindowState(config.state);

		// in case we are maximized or fullscreen, only show later after the call to maximize/fullscreen (see below)
		const isFullscreenOrMaximized = (this.currentWindowMode === WindowMode.Maximized || this.currentWindowMode === WindowMode.Fullscreen);

		const options: Electron.BrowserWindowOptions = {
			width: this.windowState.width,
			height: this.windowState.height,
			x: this.windowState.x,
			y: this.windowState.y,
			backgroundColor: this.getBackgroundColor(),
			minWidth: VSCodeWindow.MIN_WIDTH,
			minHeight: VSCodeWindow.MIN_HEIGHT,
			show: !isFullscreenOrMaximized,
			title: product.nameLong,
			webPreferences: {
				'backgroundThrottling': false, // by default if Code is in the background, intervals and timeouts get throttled,
				disableBlinkFeatures: 'Auxclick' // disable auxclick events (see https://developers.google.com/web/updates/2016/10/auxclick)
			}
		};

		if (platform.isLinux) {
			options.icon = path.join(this.environmentService.appRoot, 'resources/linux/code.png'); // Windows and Mac are better off using the embedded icon(s)
		}

		const windowConfig = this.configurationService.getConfiguration<IWindowSettings>('window');

		let useNativeTabs = false;
		if (windowConfig && windowConfig.nativeTabs) {
			options.tabbingIdentifier = product.nameShort; // this opts in to sierra tabs
			useNativeTabs = true;
		}

		let useCustomTitleStyle = false;
		if (platform.isMacintosh && (!windowConfig || !windowConfig.titleBarStyle || windowConfig.titleBarStyle === 'custom')) {
			const isDev = !this.environmentService.isBuilt || !!config.extensionDevelopmentPath;
			if (!isDev) {
				useCustomTitleStyle = true; // not enabled when developing due to https://github.com/electron/electron/issues/3647
			}
		}

		if (useNativeTabs) {
			useCustomTitleStyle = false; // native tabs on sierra do not work with custom title style
		}

		if (useCustomTitleStyle) {
			options.titleBarStyle = 'hidden';
			this.hiddenTitleBarStyle = true;
		}

		// Create the browser window.
		this._win = new BrowserWindow(options);
		this._id = this._win.id;

		if (useCustomTitleStyle) {
			this._win.setSheetOffset(22); // offset dialogs by the height of the custom title bar if we have any
		}

		// Set relaunch command
		if (platform.isWindows && product.win32AppUserModelId && typeof this._win.setAppDetails === 'function') {
			this._win.setAppDetails({
				appId: product.win32AppUserModelId,
				relaunchCommand: `"${process.execPath}" -n`,
				relaunchDisplayName: product.nameLong
			});
		}

		if (isFullscreenOrMaximized) {
			this._win.maximize();

			if (this.currentWindowMode === WindowMode.Fullscreen) {
				this._win.setFullScreen(true);
			}

			if (!this._win.isVisible()) {
				this._win.show(); // to reduce flicker from the default window size to maximize, we only show after maximize
			}
		}

		this._lastFocusTime = Date.now(); // since we show directly, we need to set the last focus time too

		// respect configured menu bar visibility
		this.onConfigurationUpdated();

		// TODO@joao: hook this up to some initialization routine this causes a race between setting the headers and doing
		// a request that needs them. chances are low
		this.setCommonHTTPHeaders();

		// Eventing
		this.registerListeners();
	}

	private setCommonHTTPHeaders(): void {
		getCommonHTTPHeaders().done(headers => {
			if (!this._win) {
				return;
			}

			const urls = ['https://marketplace.visualstudio.com/*', 'https://*.vsassets.io/*'];

			this._win.webContents.session.webRequest.onBeforeSendHeaders({ urls }, (details, cb) => {
				cb({ cancel: false, requestHeaders: objects.assign(details.requestHeaders, headers) });
			});
		});
	}

	public hasHiddenTitleBarStyle(): boolean {
		return this.hiddenTitleBarStyle;
	}

	public get isExtensionDevelopmentHost(): boolean {
		return !!this._extensionDevelopmentPath;
	}

	public get isExtensionTestHost(): boolean {
		return this._isExtensionTestHost;
	}

	public get extensionDevelopmentPath(): string {
		return this._extensionDevelopmentPath;
	}

	public get config(): IWindowConfiguration {
		return this.currentConfig;
	}

	public get id(): number {
		return this._id;
	}

	public get win(): Electron.BrowserWindow {
		return this._win;
	}

	public focus(): void {
		if (!this._win) {
			return;
		}

		if (this._win.isMinimized()) {
			this._win.restore();
		}

		this._win.focus();
	}

	public get lastFocusTime(): number {
		return this._lastFocusTime;
	}

	public get openedWorkspacePath(): string {
		return this.currentConfig.workspacePath;
	}

	public get openedFilePath(): string {
		return this.currentConfig.filesToOpen && this.currentConfig.filesToOpen[0] && this.currentConfig.filesToOpen[0].filePath;
	}

	public setReady(): void {
		this._readyState = ReadyState.READY;

		// inform all waiting promises that we are ready now
		while (this.whenReadyCallbacks.length) {
			this.whenReadyCallbacks.pop()(this);
		}
	}

	public ready(): TPromise<VSCodeWindow> {
		return new TPromise<VSCodeWindow>((c) => {
			if (this._readyState === ReadyState.READY) {
				return c(this);
			}

			// otherwise keep and call later when we are ready
			this.whenReadyCallbacks.push(c);
		});
	}

	public get readyState(): ReadyState {
		return this._readyState;
	}

	private registerNavigationListenerOn(command: 'swipe' | 'app-command', back: 'left' | 'browser-backward', forward: 'right' | 'browser-forward', acrossEditors: boolean) {
		this._win.on(command, (e, cmd) => {
			if (this.readyState !== ReadyState.READY) {
				return; // window must be ready
			}

			if (cmd === back) {
				this.send('vscode:runAction', acrossEditors ? 'workbench.action.openPreviousRecentlyUsedEditor' : 'workbench.action.navigateBack');
			} else if (cmd === forward) {
				this.send('vscode:runAction', acrossEditors ? 'workbench.action.openNextRecentlyUsedEditor' : 'workbench.action.navigateForward');
			}
		});
	}

	private registerListeners(): void {

		// Remember that we loaded
		this._win.webContents.on('did-finish-load', () => {
			this._readyState = ReadyState.LOADING;

			// Associate properties from the load request if provided
			if (this.pendingLoadConfig) {
				this.currentConfig = this.pendingLoadConfig;

				this.pendingLoadConfig = null;
			}

			// To prevent flashing, we set the window visible after the page has finished to load but before VSCode is loaded
			if (!this._win.isVisible()) {
				if (this.currentWindowMode === WindowMode.Maximized) {
					this._win.maximize();
				}

				if (!this._win.isVisible()) { // maximize also makes visible
					this._win.show();
				}
			}
		});

		// App commands support
		this.registerNavigationListenerOn('app-command', 'browser-backward', 'browser-forward', false);

		// Handle code that wants to open links
		this._win.webContents.on('new-window', (event: Event, url: string) => {
			event.preventDefault();

			shell.openExternal(url);
		});

		// Window Focus
		this._win.on('focus', () => {
			this._lastFocusTime = Date.now();
		});

		// Window Fullscreen
		this._win.on('enter-full-screen', () => {
			this.sendWhenReady('vscode:enterFullScreen');
		});

		this._win.on('leave-full-screen', () => {
			this.sendWhenReady('vscode:leaveFullScreen');
		});

		// React to HC color scheme changes (Windows)
		if (platform.isWindows) {
			systemPreferences.on('inverted-color-scheme-changed', () => {
				if (systemPreferences.isInvertedColorScheme()) {
					this.sendWhenReady('vscode:enterHighContrast');
				} else {
					this.sendWhenReady('vscode:leaveHighContrast');
				}
			});
		}

		// Window Failed to load
		this._win.webContents.on('did-fail-load', (event: Event, errorCode: string, errorDescription: string) => {
			console.warn('[electron event]: fail to load, ', errorDescription);
		});

		// Prevent any kind of navigation triggered by the user!
		// But do not touch this in dev version because it will prevent "Reload" from dev tools
		if (this.environmentService.isBuilt) {
			this._win.webContents.on('will-navigate', (event: Event) => {
				if (event) {
					event.preventDefault();
				}
			});
		}

		// Handle configuration changes
		this.toDispose.push(this.configurationService.onDidUpdateConfiguration(e => this.onConfigurationUpdated()));
	}

	private onConfigurationUpdated(): void {
		const newMenuBarVisibility = this.getMenuBarVisibility();
		if (newMenuBarVisibility !== this.currentMenuBarVisibility) {
			this.currentMenuBarVisibility = newMenuBarVisibility;
			this.setMenuBarVisibility(newMenuBarVisibility);
		}

		// Swipe command support (macOS)
		if (platform.isMacintosh) {
			const config = this.configurationService.getConfiguration<IWorkbenchEditorConfiguration>();
			if (config && config.workbench && config.workbench.editor && config.workbench.editor.swipeToNavigate) {
				this.registerNavigationListenerOn('swipe', 'left', 'right', true);
			} else {
				this._win.removeAllListeners('swipe');
			}
		}
	};

	public load(config: IWindowConfiguration): void {

		// If this is the first time the window is loaded, we associate the paths
		// directly with the window because we assume the loading will just work
		if (this.readyState === ReadyState.NONE) {
			this.currentConfig = config;
		}

		// Otherwise, the window is currently showing a folder and if there is an
		// unload handler preventing the load, we cannot just associate the paths
		// because the loading might be vetoed. Instead we associate it later when
		// the window load event has fired.
		else {
			this.pendingLoadConfig = config;
			this._readyState = ReadyState.NAVIGATING;
		}

		// Make sure to clear any previous edited state
		if (platform.isMacintosh && this._win.isDocumentEdited()) {
			this._win.setDocumentEdited(false);
		}

		// Load URL
		this._win.loadURL(this.getUrl(config));

		// Make window visible if it did not open in N seconds because this indicates an error
		// Only do this when running out of sources and not when running tests
		if (!this.environmentService.isBuilt && !this.environmentService.extensionTestsPath) {
			this.showTimeoutHandle = setTimeout(() => {
				if (this._win && !this._win.isVisible() && !this._win.isMinimized()) {
					this._win.show();
					this._win.focus();
					this._win.webContents.openDevTools();
				}
			}, 10000);
		}

		// (--prof-startup) save profile to disk
		const { profileStartup } = this.environmentService;
		if (profileStartup) {
			stopProfiling(profileStartup.dir, profileStartup.prefix)
				.done(undefined, err => console.error(err));
		}
	}

	public reload(cli?: ParsedArgs): void {

		// Inherit current properties but overwrite some
		const configuration: IWindowConfiguration = objects.mixin({}, this.currentConfig);
		delete configuration.filesToOpen;
		delete configuration.filesToCreate;
		delete configuration.filesToDiff;

		// Some configuration things get inherited if the window is being reloaded and we are
		// in extension development mode. These options are all development related.
		if (this.isExtensionDevelopmentHost && cli) {
			configuration.verbose = cli.verbose;
			configuration.debugPluginHost = cli.debugPluginHost;
			configuration.debugBrkPluginHost = cli.debugBrkPluginHost;
			configuration['extensions-dir'] = cli['extensions-dir'];
		}

		configuration.isInitialStartup = false; // since this is a reload

		// Load config
		this.load(configuration);
	}

	private getUrl(windowConfiguration: IWindowConfiguration): string {
		let url = require.toUrl('vs/workbench/electron-browser/bootstrap/index.html');

		// Set zoomlevel
		const windowConfig = this.configurationService.getConfiguration<IWindowSettings>('window');
		const zoomLevel = windowConfig && windowConfig.zoomLevel;
		if (typeof zoomLevel === 'number') {
			windowConfiguration.zoomLevel = zoomLevel;
		}

		// Set fullscreen state
		windowConfiguration.fullscreen = this._win.isFullScreen();

		// Set Accessibility Config
		windowConfiguration.highContrast = platform.isWindows && systemPreferences.isInvertedColorScheme() && (!windowConfig || windowConfig.autoDetectHighContrast);
		windowConfiguration.accessibilitySupport = app.isAccessibilitySupportEnabled();

		// Theme
		windowConfiguration.baseTheme = this.getBaseTheme();
		windowConfiguration.backgroundColor = this.getBackgroundColor();

		// Perf Counters
		windowConfiguration.perfStartTime = global.perfStartTime;
		windowConfiguration.perfAppReady = global.perfAppReady;
		windowConfiguration.perfWindowLoadTime = Date.now();

		// Config (combination of process.argv and window configuration)
		const environment = parseArgs(process.argv);
		const config = objects.assign(environment, windowConfiguration);
		for (let key in config) {
			if (!config[key]) {
				delete config[key]; // only send over properties that have a true value
			}
		}

		url += '?config=' + encodeURIComponent(JSON.stringify(config));

		return url;
	}

	private getBaseTheme(): string {
		if (platform.isWindows && systemPreferences.isInvertedColorScheme()) {
			return 'hc-black';
		}
		const theme = this.storageService.getItem<string>(VSCodeWindow.themeStorageKey, 'vs-dark');
		return theme.split(' ')[0];
	}

	private getBackgroundColor(): string {
		if (platform.isWindows && systemPreferences.isInvertedColorScheme()) {
			return '#000000';
		}

		let background = this.storageService.getItem<string>(VSCodeWindow.themeBackgroundStorageKey, null);
		if (!background) {
			let baseTheme = this.getBaseTheme();
			return baseTheme === 'hc-black' ? '#000000' : (baseTheme === 'vs' ? '#FFFFFF' : (platform.isMacintosh ? '#171717' : '#1E1E1E')); // https://github.com/electron/electron/issues/5150
		}

		return background;
	}

	public serializeWindowState(): IWindowState {

		// fullscreen gets special treatment
		if (this._win.isFullScreen()) {
			const display = screen.getDisplayMatching(this.getBounds());

			return {
				mode: WindowMode.Fullscreen,
				display: display ? display.id : void 0,

				// still carry over window dimensions from previous sessions!
				width: this.windowState.width,
				height: this.windowState.height,
				x: this.windowState.x,
				y: this.windowState.y
			};
		}

		const state: IWindowState = Object.create(null);
		let mode: WindowMode;

		// get window mode
		if (!platform.isMacintosh && this._win.isMaximized()) {
			mode = WindowMode.Maximized;
		} else {
			mode = WindowMode.Normal;
		}

		// we don't want to save minimized state, only maximized or normal
		if (mode === WindowMode.Maximized) {
			state.mode = WindowMode.Maximized;
		} else {
			state.mode = WindowMode.Normal;
		}

		// only consider non-minimized window states
		if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
			const bounds = this.getBounds();

			state.x = bounds.x;
			state.y = bounds.y;
			state.width = bounds.width;
			state.height = bounds.height;
		}

		return state;
	}

	private restoreWindowState(state?: IWindowState): void {
		if (state) {
			try {
				state = this.validateWindowState(state);
			} catch (err) {
				this.logService.log(`Unexpected error validating window state: ${err}\n${err.stack}`); // somehow display API can be picky about the state to validate
			}
		}

		if (!state) {
			state = defaultWindowState();
		}

		this.windowState = state;
		this.currentWindowMode = this.windowState.mode;
	}

	private validateWindowState(state: IWindowState): IWindowState {
		if (!state) {
			return null;
		}

		if ([state.x, state.y, state.width, state.height].some(n => typeof n !== 'number')) {
			return null;
		}

		if (state.width <= 0 || state.height <= 0) {
			return null;
		}

		const displays = screen.getAllDisplays();

		// Single Monitor: be strict about x/y positioning
		if (displays.length === 1) {
			const displayBounds = displays[0].bounds;

			// Careful with maximized: in that mode x/y can well be negative!
			if (state.mode !== WindowMode.Maximized && displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
				if (state.x < displayBounds.x) {
					state.x = displayBounds.x; // prevent window from falling out of the screen to the left
				}

				if (state.y < displayBounds.y) {
					state.y = displayBounds.y; // prevent window from falling out of the screen to the top
				}

				if (state.x > (displayBounds.x + displayBounds.width)) {
					state.x = displayBounds.x; // prevent window from falling out of the screen to the right
				}

				if (state.y > (displayBounds.y + displayBounds.height)) {
					state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
				}

				if (state.width > displayBounds.width) {
					state.width = displayBounds.width; // prevent window from exceeding display bounds width
				}

				if (state.height > displayBounds.height) {
					state.height = displayBounds.height; // prevent window from exceeding display bounds height
				}
			}

			if (state.mode === WindowMode.Maximized) {
				return defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
			}

			return state;
		}

		// Multi Montior (fullscreen): try to find the previously used display
		if (state.display && state.mode === WindowMode.Fullscreen) {
			const display = displays.filter(d => d.id === state.display)[0];
			if (display && display.bounds && typeof display.bounds.x === 'number' && typeof display.bounds.y === 'number') {
				const defaults = defaultWindowState(WindowMode.Fullscreen); // make sure we have good values when the user restores the window
				defaults.x = display.bounds.x; // carefull to use displays x/y position so that the window ends up on the correct monitor
				defaults.y = display.bounds.y;

				return defaults;
			}
		}

		// Multi Monitor (non-fullscreen): be less strict because metrics can be crazy
		const bounds = { x: state.x, y: state.y, width: state.width, height: state.height };
		const display = screen.getDisplayMatching(bounds);
		if (display && display.bounds.x + display.bounds.width > bounds.x && display.bounds.y + display.bounds.height > bounds.y) {
			if (state.mode === WindowMode.Maximized) {
				const defaults = defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
				defaults.x = state.x; // carefull to keep x/y position so that the window ends up on the correct monitor
				defaults.y = state.y;

				return defaults;
			}

			return state;
		}

		return null;
	}

	public getBounds(): Electron.Rectangle {
		const pos = this._win.getPosition();
		const dimension = this._win.getSize();

		return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
	}

	public toggleFullScreen(): void {
		const willBeFullScreen = !this._win.isFullScreen();

		// set fullscreen flag on window
		this._win.setFullScreen(willBeFullScreen);

		// respect configured menu bar visibility or default to toggle if not set
		this.setMenuBarVisibility(this.currentMenuBarVisibility, false);
	}

	private getMenuBarVisibility(): MenuBarVisibility {
		const windowConfig = this.configurationService.getConfiguration<IWindowSettings>('window');
		if (!windowConfig || !windowConfig.menuBarVisibility) {
			return 'default';
		}

		let menuBarVisibility = windowConfig.menuBarVisibility;
		if (['visible', 'toggle', 'hidden'].indexOf(menuBarVisibility) < 0) {
			menuBarVisibility = 'default';
		}

		return menuBarVisibility;
	}

	public setMenuBarVisibility(visibility: MenuBarVisibility, notify: boolean = true): void {
		if (platform.isMacintosh) {
			return; // ignore for macOS platform
		}

		const isFullscreen = this._win.isFullScreen();

		switch (visibility) {
			case ('default'):
				this._win.setMenuBarVisibility(!isFullscreen);
				this._win.setAutoHideMenuBar(isFullscreen);
				break;

			case ('visible'):
				this._win.setMenuBarVisibility(true);
				this._win.setAutoHideMenuBar(false);
				break;

			case ('toggle'):
				this._win.setMenuBarVisibility(false);
				this._win.setAutoHideMenuBar(true);

				if (notify) {
					this.send('vscode:showInfoMessage', nls.localize('hiddenMenuBar', "You can still access the menu bar by pressing the **Alt** key."));
				};
				break;

			case ('hidden'):
				// for some weird reason that I have no explanation for, the menu bar is not hiding when calling
				// this without timeout (see https://github.com/Microsoft/vscode/issues/19777). there seems to be
				// a timing issue with us opening the first window and the menu bar getting created. somehow the
				// fact that we want to hide the menu without being able to bring it back via Alt key makes Electron
				// still show the menu. Unable to reproduce from a simple Hello World application though...
				setTimeout(() => {
					this._win.setMenuBarVisibility(false);
					this._win.setAutoHideMenuBar(false);
				});
				break;
		};
	}

	public sendWhenReady(channel: string, ...args: any[]): void {
		this.ready().then(() => {
			this.send(channel, ...args);
		});
	}

	public send(channel: string, ...args: any[]): void {
		this._win.webContents.send(channel, ...args);
	}

	public dispose(): void {
		if (this.showTimeoutHandle) {
			clearTimeout(this.showTimeoutHandle);
		}

		this.toDispose = dispose(this.toDispose);

		this._win = null; // Important to dereference the window object to allow for GC
	}
}