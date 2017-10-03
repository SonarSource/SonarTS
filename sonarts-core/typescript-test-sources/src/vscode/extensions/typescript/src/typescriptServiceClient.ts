/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import * as electron from './utils/electron';
import { Reader } from './utils/wireProtocol';

import { workspace, window, Uri, CancellationToken, Disposable, Memento, MessageItem, QuickPickItem, EventEmitter, Event, commands, WorkspaceConfiguration } from 'vscode';
import * as Proto from './protocol';
import { ITypescriptServiceClient, ITypescriptServiceClientHost, API } from './typescriptService';
import { TypeScriptServerPlugin } from './utils/plugins';
import Logger from './utils/logger';

import * as VersionStatus from './utils/versionStatus';
import * as is from './utils/is';

import TelemetryReporter from 'vscode-extension-telemetry';

import * as nls from 'vscode-nls';
const localize = nls.loadMessageBundle();

interface CallbackItem {
	c: (value: any) => void;
	e: (err: any) => void;
	start: number;
}

interface CallbackMap {
	[key: number]: CallbackItem;
}

interface RequestItem {
	request: Proto.Request;
	promise: Promise<any> | null;
	callbacks: CallbackItem | null;
}

interface IPackageInfo {
	name: string;
	version: string;
	aiKey: string;
}

enum Trace {
	Off,
	Messages,
	Verbose
}

namespace Trace {
	export function fromString(value: string): Trace {
		value = value.toLowerCase();
		switch (value) {
			case 'off':
				return Trace.Off;
			case 'messages':
				return Trace.Messages;
			case 'verbose':
				return Trace.Verbose;
			default:
				return Trace.Off;
		}
	}
}

enum TsServerLogLevel {
	Off,
	Normal,
	Terse,
	Verbose,
}

namespace TsServerLogLevel {
	export function fromString(value: string): TsServerLogLevel {
		switch (value && value.toLowerCase()) {
			case 'normal':
				return TsServerLogLevel.Normal;
			case 'terse':
				return TsServerLogLevel.Terse;
			case 'verbose':
				return TsServerLogLevel.Verbose;
			case 'off':
			default:
				return TsServerLogLevel.Off;
		}
	}

	export function toString(value: TsServerLogLevel): string {
		switch (value) {
			case TsServerLogLevel.Normal:
				return 'normal';
			case TsServerLogLevel.Terse:
				return 'terse';
			case TsServerLogLevel.Verbose:
				return 'verbose';
			case TsServerLogLevel.Off:
			default:
				return 'off';
		}
	}
}

enum MessageAction {
	useLocal,
	useBundled,
	learnMore,
	reportIssue
}

interface MyQuickPickItem extends QuickPickItem {
	id: MessageAction;
}

interface MyMessageItem extends MessageItem {
	id: MessageAction;
}

export default class TypeScriptServiceClient implements ITypescriptServiceClient {
	private static useWorkspaceTsdkStorageKey = 'typescript.useWorkspaceTsdk';
	private static tsdkMigratedStorageKey = 'typescript.tsdkMigrated';

	private static readonly WALK_THROUGH_SNIPPET_SCHEME = 'walkThroughSnippet';
	private static readonly WALK_THROUGH_SNIPPET_SCHEME_COLON = `${TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME}:`;

	private host: ITypescriptServiceClientHost;
	private storagePath: string | undefined;
	private globalState: Memento;
	private pathSeparator: string;
	private modulePath: string | undefined;

	private _onReady: { promise: Promise<void>; resolve: () => void; reject: () => void; };
	private globalTsdk: string | null;
	private localTsdk: string | null;
	private _checkGlobalTSCVersion: boolean;
	private _experimentalAutoBuild: boolean;
	private trace: Trace;
	private readonly logger: Logger = new Logger();
	private tsServerLogFile: string | null = null;
	private tsServerLogLevel: TsServerLogLevel = TsServerLogLevel.Off;
	private servicePromise: Thenable<cp.ChildProcess> | null;
	private lastError: Error | null;
	private reader: Reader<Proto.Response>;
	private sequenceNumber: number;
	private firstStart: number;
	private lastStart: number;
	private numberRestarts: number;
	private cancellationPipeName: string | null = null;

	private requestQueue: RequestItem[];
	private pendingResponses: number;
	private callbacks: CallbackMap;
	private _onProjectLanguageServiceStateChanged = new EventEmitter<Proto.ProjectLanguageServiceStateEventBody>();
	private _onDidBeginInstallTypings = new EventEmitter<Proto.BeginInstallTypesEventBody>();
	private _onDidEndInstallTypings = new EventEmitter<Proto.EndInstallTypesEventBody>();
	private _onTypesInstallerInitializationFailed = new EventEmitter<Proto.TypesInstallerInitializationFailedEventBody>();

	private _packageInfo: IPackageInfo | null;
	private _apiVersion: API;
	private telemetryReporter: TelemetryReporter;
	private checkJs: boolean;

	constructor(
		host: ITypescriptServiceClientHost,
		storagePath: string | undefined,
		globalState: Memento,
		private workspaceState: Memento,
		private plugins: TypeScriptServerPlugin[],
		disposables: Disposable[]
	) {
		this.host = host;
		this.storagePath = storagePath;
		this.globalState = globalState;
		this.pathSeparator = path.sep;
		this.lastStart = Date.now();

		var p = new Promise<void>((resolve, reject) => {
			this._onReady = { promise: p, resolve, reject };
		});
		this._onReady.promise = p;

		this.servicePromise = null;
		this.lastError = null;
		this.sequenceNumber = 0;
		this.firstStart = Date.now();
		this.numberRestarts = 0;

		this.requestQueue = [];
		this.pendingResponses = 0;
		this.callbacks = Object.create(null);
		const configuration = workspace.getConfiguration();
		this.globalTsdk = this.extractGlobalTsdk(configuration);
		this.localTsdk = this.extractLocalTsdk(configuration);

		this._experimentalAutoBuild = false; // configuration.get<boolean>('typescript.tsserver.experimentalAutoBuild', false);
		this._apiVersion = new API('1.0.0');
		this._checkGlobalTSCVersion = true;
		this.trace = this.readTrace();
		this.tsServerLogLevel = this.readTsServerLogLevel();
		this.checkJs = this.readCheckJs();

		disposables.push(workspace.onDidChangeConfiguration(() => {
			let oldLoggingLevel = this.tsServerLogLevel;
			let oldglobalTsdk = this.globalTsdk;
			let oldLocalTsdk = this.localTsdk;
			let oldCheckJs = this.checkJs;

			this.trace = this.readTrace();
			this.tsServerLogLevel = this.readTsServerLogLevel();

			const configuration = workspace.getConfiguration();
			this.globalTsdk = this.extractGlobalTsdk(configuration);
			this.localTsdk = this.extractLocalTsdk(configuration);
			this.checkJs = this.readCheckJs();

			if (this.servicePromise && oldCheckJs !== this.checkJs) {
				this.setCompilerOptionsForInferredProjects();
			}

			if (this.servicePromise === null && (oldglobalTsdk !== this.globalTsdk || oldLocalTsdk !== this.localTsdk)) {
				this.startService();
			} else if (this.servicePromise !== null && (this.tsServerLogLevel !== oldLoggingLevel || oldglobalTsdk !== this.globalTsdk || oldLocalTsdk !== this.localTsdk)) {
				this.restartTsServer();
			}
		}));
		if (this.packageInfo && this.packageInfo.aiKey) {
			this.telemetryReporter = new TelemetryReporter(this.packageInfo.name, this.packageInfo.version, this.packageInfo.aiKey);
			disposables.push(this.telemetryReporter);
		}
		this.startService();
	}

	public restartTsServer(): void {
		const start = () => {
			this.trace = this.readTrace();
			this.tsServerLogLevel = this.readTsServerLogLevel();
			this.servicePromise = this.startService();
			return this.servicePromise;
		};

		if (this.servicePromise !== null) {
			this.servicePromise = this.servicePromise.then(cp => {
				if (cp) {
					cp.kill();
				}
			}).then(start);
		} else {
			start();
		}
	}


	private extractGlobalTsdk(configuration: WorkspaceConfiguration): string | null {
		let inspect = configuration.inspect('typescript.tsdk');
		if (inspect && inspect.globalValue && 'string' === typeof inspect.globalValue) {
			return inspect.globalValue;
		}
		if (inspect && inspect.defaultValue && 'string' === typeof inspect.defaultValue) {
			return inspect.defaultValue;
		}
		return null;
	}

	private extractLocalTsdk(configuration: WorkspaceConfiguration): string | null {
		let inspect = configuration.inspect('typescript.tsdk');
		if (inspect && inspect.workspaceValue && 'string' === typeof inspect.workspaceValue) {
			return inspect.workspaceValue;
		}
		return null;
	}

	get onProjectLanguageServiceStateChanged(): Event<Proto.ProjectLanguageServiceStateEventBody> {
		return this._onProjectLanguageServiceStateChanged.event;
	}

	get onDidBeginInstallTypings(): Event<Proto.BeginInstallTypesEventBody> {
		return this._onDidBeginInstallTypings.event;
	}

	get onDidEndInstallTypings(): Event<Proto.EndInstallTypesEventBody> {
		return this._onDidEndInstallTypings.event;
	}

	get onTypesInstallerInitializationFailed(): Event<Proto.TypesInstallerInitializationFailedEventBody> {
		return this._onTypesInstallerInitializationFailed.event;
	}

	private readTrace(): Trace {
		let result: Trace = Trace.fromString(workspace.getConfiguration().get<string>('typescript.tsserver.trace', 'off'));
		if (result === Trace.Off && !!process.env.TSS_TRACE) {
			result = Trace.Messages;
		}
		return result;
	}

	private readTsServerLogLevel(): TsServerLogLevel {
		const setting = workspace.getConfiguration().get<string>('typescript.tsserver.log', 'off');
		return TsServerLogLevel.fromString(setting);
	}

	private readCheckJs(): boolean {
		return workspace.getConfiguration().get<boolean>('javascript.implicitProjectConfig.checkJs', false);
	}

	public get experimentalAutoBuild(): boolean {
		return this._experimentalAutoBuild;
	}

	public get checkGlobalTSCVersion(): boolean {
		return this._checkGlobalTSCVersion;
	}

	public get apiVersion(): API {
		return this._apiVersion;
	}

	public onReady(): Promise<void> {
		return this._onReady.promise;
	}

	public info(message: string, data?: any): void {
		this.logger.info(message, data);
	}

	public warn(message: string, data?: any): void {
		this.logger.warn(message, data);
	}

	public error(message: string, data?: any): void {
		this.logger.error(message, data);
	}

	private logTrace(message: string, data?: any): void {
		this.logger.logLevel('Trace', message, data);
	}

	private get packageInfo(): IPackageInfo | null {

		if (this._packageInfo !== undefined) {
			return this._packageInfo;
		}
		let packagePath = path.join(__dirname, './../package.json');
		let extensionPackage = require(packagePath);
		if (extensionPackage) {
			this._packageInfo = {
				name: extensionPackage.name,
				version: extensionPackage.version,
				aiKey: extensionPackage.aiKey
			};
		} else {
			this._packageInfo = null;
		}

		return this._packageInfo;
	}

	public logTelemetry(eventName: string, properties?: { [prop: string]: string }) {
		if (this.telemetryReporter) {
			this.telemetryReporter.sendTelemetryEvent(eventName, properties);
		}
	}

	private service(): Thenable<cp.ChildProcess> {
		if (this.servicePromise) {
			return this.servicePromise;
		}
		if (this.lastError) {
			return Promise.reject<cp.ChildProcess>(this.lastError);
		}
		this.startService();
		if (this.servicePromise) {
			return this.servicePromise;
		}
		return Promise.reject<cp.ChildProcess>(new Error('Could not create TS service'));
	}

	private get bundledTypeScriptPath(): string {
		try {
			return require.resolve('typescript/lib/tsserver.js');
		} catch (e) {
			return '';
		}
	}

	private get localTypeScriptPath(): string | null {
		if (!workspace.rootPath) {
			return null;
		}

		if (this.localTsdk) {
			this._checkGlobalTSCVersion = false;
			if ((<any>path).isAbsolute(this.localTsdk)) {
				return path.join(this.localTsdk, 'tsserver.js');
			}
			return path.join(workspace.rootPath, this.localTsdk, 'tsserver.js');
		}

		const localModulePath = path.join(workspace.rootPath, 'node_modules', 'typescript', 'lib', 'tsserver.js');
		if (fs.existsSync(localModulePath) && this.getTypeScriptVersion(localModulePath)) {
			return localModulePath;
		}
		return null;
	}

	private get globalTypescriptPath(): string {
		if (this.globalTsdk) {
			this._checkGlobalTSCVersion = false;
			if ((<any>path).isAbsolute(this.globalTsdk)) {
				return path.join(this.globalTsdk, 'tsserver.js');
			} else if (workspace.rootPath) {
				return path.join(workspace.rootPath, this.globalTsdk, 'tsserver.js');
			}
		}

		return this.bundledTypeScriptPath;
	}

	private hasWorkspaceTsdkSetting(): boolean {
		return !!this.localTsdk;
	}

	private startService(resendModels: boolean = false): Thenable<cp.ChildProcess> {
		let modulePath: Thenable<string> = Promise.resolve(this.globalTypescriptPath);

		if (!this.workspaceState.get<boolean>(TypeScriptServiceClient.tsdkMigratedStorageKey, false)) {
			this.workspaceState.update(TypeScriptServiceClient.tsdkMigratedStorageKey, true);
			if (workspace.rootPath && this.hasWorkspaceTsdkSetting()) {
				modulePath = this.showVersionPicker(true);
			}
		}

		return modulePath.then(modulePath => {
			if (this.workspaceState.get<boolean>(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false)) {
				if (workspace.rootPath) {
					// TODO: check if we need better error handling
					return this.localTypeScriptPath || modulePath;
				}
			}
			return modulePath;
		}).then(modulePath => {
			return this.servicePromise = new Promise<cp.ChildProcess>((resolve, reject) => {
				const tsConfig = workspace.getConfiguration('typescript');

				this.info(`Using tsserver from: ${modulePath}`);
				if (!fs.existsSync(modulePath)) {
					window.showWarningMessage(localize('noServerFound', 'The path {0} doesn\'t point to a valid tsserver install. Falling back to bundled TypeScript version.', modulePath ? path.dirname(modulePath) : ''));
					if (!this.bundledTypeScriptPath) {
						window.showErrorMessage(localize('noBundledServerFound', 'VSCode\'s tsserver was deleted by another application such as a misbehaving virus detection tool. Please reinstall VS Code.'));
						return reject(new Error('Could not find bundled tsserver.js'));
					}
					modulePath = this.bundledTypeScriptPath;
				}

				let version = this.getTypeScriptVersion(modulePath);
				if (!version) {
					version = workspace.getConfiguration().get<string | undefined>('typescript.tsdk_version', undefined);
				}
				if (version) {
					this._apiVersion = new API(version);
				}

				const label = version || localize('versionNumber.custom', 'custom');
				const tooltip = modulePath;
				this.modulePath = modulePath;
				VersionStatus.showHideStatus();
				VersionStatus.setInfo(label, tooltip);

				// This is backwards compatibility code to move the setting from the local
				// store into the workspace setting file.
				const doGlobalVersionCheckKey: string = 'doGlobalVersionCheck';
				const globalStateValue = this.globalState.get(doGlobalVersionCheckKey, true);
				const checkTscVersion = 'check.tscVersion';
				if (!globalStateValue) {
					tsConfig.update(checkTscVersion, false, true);
					this.globalState.update(doGlobalVersionCheckKey, true);
				}

				this.sequenceNumber = 0;
				this.requestQueue = [];
				this.pendingResponses = 0;
				this.lastError = null;

				try {
					let options: electron.IForkOptions = {
						execArgv: [] // [`--debug-brk=5859`]
					};
					if (workspace.rootPath) {
						options.cwd = workspace.rootPath;
					}
					let value = process.env.TSS_DEBUG;
					if (value) {
						let port = parseInt(value);
						if (!isNaN(port)) {
							this.info(`TSServer started in debug mode using port ${port}`);
							options.execArgv = [`--debug=${port}`];
						}
					}
					let args: string[] = [];
					if (this.apiVersion.has206Features()) {
						args.push('--useSingleInferredProject');
						if (workspace.getConfiguration().get<boolean>('typescript.disableAutomaticTypeAcquisition', false)) {
							args.push('--disableAutomaticTypingAcquisition');
						}
					}
					if (this.apiVersion.has208Features()) {
						args.push('--enableTelemetry');
					}
					if (this.apiVersion.has222Features()) {
						this.cancellationPipeName = electron.getPipeName(`tscancellation-${electron.makeRandomHexString(20)}`);
						args.push('--cancellationPipeName', this.cancellationPipeName + '*');
					}

					if (this.apiVersion.has222Features()) {
						if (this.tsServerLogLevel !== TsServerLogLevel.Off) {
							try {
								const logDir = fs.mkdtempSync(path.join(os.tmpdir(), `vscode-tsserver-log-`));
								this.tsServerLogFile = path.join(logDir, `tsserver.log`);
								this.info(`TSServer log file: ${this.tsServerLogFile}`);
							} catch (e) {
								this.error('Could not create TSServer log directory');
							}

							if (this.tsServerLogFile) {
								args.push('--logVerbosity', TsServerLogLevel.toString(this.tsServerLogLevel));
								args.push('--logFile', this.tsServerLogFile);
							}
						}
					}

					if (this.apiVersion.has230Features()) {
						if (this.plugins.length) {
							args.push('--globalPlugins', this.plugins.map(x => x.name).join(','));
							if (modulePath === this.globalTypescriptPath) {
								args.push('--pluginProbeLocations', this.plugins.map(x => x.path).join(','));
							}
						}
					}

					electron.fork(modulePath, args, options, this.logger, (err: any, childProcess: cp.ChildProcess) => {
						if (err) {
							this.lastError = err;
							this.error('Starting TSServer failed with error.', err);
							window.showErrorMessage(localize('serverCouldNotBeStarted', 'TypeScript language server couldn\'t be started. Error message is: {0}', err.message || err));
							this.logTelemetry('error', { message: err.message });
							return;
						}
						this.lastStart = Date.now();
						childProcess.on('error', (err: Error) => {
							this.lastError = err;
							this.error('TSServer errored with error.', err);
							if (this.tsServerLogFile) {
								this.error(`TSServer log file: ${this.tsServerLogFile}`);
							}
							this.serviceExited(false);
						});
						childProcess.on('exit', (code: any) => {
							if (code === null || typeof code === 'undefined') {
								this.info(`TSServer exited`);
							} else {
								this.error(`TSServer exited with code: ${code}`);
							}

							if (this.tsServerLogFile) {
								this.info(`TSServer log file: ${this.tsServerLogFile}`);
							}
							this.serviceExited(true);
						});
						this.reader = new Reader<Proto.Response>(childProcess.stdout, (msg) => {
							this.dispatchMessage(msg);
						});
						this._onReady.resolve();
						resolve(childProcess);
						this.serviceStarted(resendModels);
					});
				} catch (error) {
					reject(error);
				}
			});
		});
	}

	public onVersionStatusClicked(): Thenable<string> {
		return this.showVersionPicker(false);
	}

	private showVersionPicker(firstRun: boolean): Thenable<string> {
		const modulePath = this.modulePath || this.globalTypescriptPath;
		if (!workspace.rootPath || !modulePath) {
			return Promise.resolve(modulePath);
		}

		const useWorkspaceVersionSetting = this.workspaceState.get<boolean>(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false);
		const shippedVersion = this.getTypeScriptVersion(this.globalTypescriptPath);
		const localModulePath = this.localTypeScriptPath;

		const pickOptions: MyQuickPickItem[] = [];

		pickOptions.push({
			label: localize('useVSCodeVersionOption', 'Use VSCode\'s Version'),
			description: shippedVersion || this.globalTypescriptPath,
			detail: modulePath === this.globalTypescriptPath && (modulePath !== localModulePath || !useWorkspaceVersionSetting) ? localize('activeVersion', 'Currently active') : '',
			id: MessageAction.useBundled,
		});

		if (localModulePath) {
			const localVersion = this.getTypeScriptVersion(localModulePath);
			pickOptions.push({
				label: localize('useWorkspaceVersionOption', 'Use Workspace Version'),
				description: localVersion || localModulePath,
				detail: modulePath === localModulePath && (modulePath !== this.globalTypescriptPath || useWorkspaceVersionSetting) ? localize('activeVersion', 'Currently active') : '',
				id: MessageAction.useLocal
			});
		}

		pickOptions.push({
			label: localize('learnMore', 'Learn More'),
			description: '',
			id: MessageAction.learnMore
		});

		const tryShowRestart = (newModulePath: string) => {
			if (firstRun || newModulePath === this.modulePath) {
				return;
			}
			this.restartTsServer();
		};

		return window.showQuickPick<MyQuickPickItem>(pickOptions, {
			placeHolder: localize(
				'selectTsVersion',
				'Select the TypeScript version used for JavaScript and TypeScript language features'),
			ignoreFocusOut: firstRun
		})
			.then(selected => {
				if (!selected) {
					return modulePath;
				}
				switch (selected.id) {
					case MessageAction.useLocal:
						return this.workspaceState.update(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, true)
							.then(_ => {
								if (localModulePath) {
									tryShowRestart(localModulePath);
								}
								return localModulePath || '';
							});
					case MessageAction.useBundled:
						return this.workspaceState.update(TypeScriptServiceClient.useWorkspaceTsdkStorageKey, false)
							.then(_ => {
								tryShowRestart(this.globalTypescriptPath);
								return this.globalTypescriptPath;
							});
					case MessageAction.learnMore:
						commands.executeCommand('vscode.open', Uri.parse('https://go.microsoft.com/fwlink/?linkid=839919'));
						return modulePath;
					default:
						return modulePath;
				}
			});
	}

	public openTsServerLogFile(): Thenable<boolean> {
		if (!this.apiVersion.has222Features()) {
			return window.showErrorMessage(
				localize(
					'typescript.openTsServerLog.notSupported',
					'TS Server logging requires TS 2.2.2+'))
				.then(() => false);
		}

		if (this.tsServerLogLevel === TsServerLogLevel.Off) {
			return window.showErrorMessage<MessageItem>(
				localize(
					'typescript.openTsServerLog.loggingNotEnabled',
					'TS Server logging is off. Please set `typescript.tsserver.log` and restart the TS server to enable logging'),
				{
					title: localize(
						'typescript.openTsServerLog.enableAndReloadOption',
						'Enable logging and restart TS server'),
				})
				.then(selection => {
					if (selection) {
						return workspace.getConfiguration().update('typescript.tsserver.log', 'verbose', true).then(() => {
							this.restartTsServer();
							return false;
						});
					}
					return false;
				});
		}

		if (!this.tsServerLogFile) {
			return window.showWarningMessage(localize(
				'typescript.openTsServerLog.noLogFile',
				'TS Server has not started logging.')).then(() => false);
		}

		return commands.executeCommand('_workbench.action.files.revealInOS', Uri.parse(this.tsServerLogFile))
			.then(() => true, () => {
				window.showWarningMessage(localize(
					'openTsServerLog.openFileFailedFailed',
					'Could not open TS Server log file'));
				return false;
			});
	}

	private serviceStarted(resendModels: boolean): void {
		let configureOptions: Proto.ConfigureRequestArguments = {
			hostInfo: 'vscode'
		};
		if (this._experimentalAutoBuild && this.storagePath) {
			try {
				fs.mkdirSync(this.storagePath);
			} catch (error) {
			}
			// configureOptions.autoDiagnostics = true;
		}
		this.execute('configure', configureOptions);
		this.setCompilerOptionsForInferredProjects();
		if (resendModels) {
			this.host.populateService();
		}
	}

	private setCompilerOptionsForInferredProjects(): void {
		if (!this.apiVersion.has206Features()) {
			return;
		}

		const compilerOptions: Proto.ExternalProjectCompilerOptions = {
			module: 'CommonJS',
			target: 'ES6',
			allowSyntheticDefaultImports: true,
			allowNonTsExtensions: true,
			allowJs: true,
			jsx: 'Preserve'
		};

		if (this.apiVersion.has230Features()) {
			compilerOptions.checkJs = workspace.getConfiguration('javascript').get<boolean>('implicitProjectConfig.checkJs', false);
		}

		const args: Proto.SetCompilerOptionsForInferredProjectsArgs = {
			options: compilerOptions
		};
		this.execute('compilerOptionsForInferredProjects', args, true).catch((err) => {
			this.error(`'compilerOptionsForInferredProjects' request failed with error.`, err);
		});
	}

	private getTypeScriptVersion(serverPath: string): string | undefined {
		if (!fs.existsSync(serverPath)) {
			return undefined;
		}

		let p = serverPath.split(path.sep);
		if (p.length <= 2) {
			return undefined;
		}
		let p2 = p.slice(0, -2);
		let modulePath = p2.join(path.sep);
		let fileName = path.join(modulePath, 'package.json');
		if (!fs.existsSync(fileName)) {
			return undefined;
		}
		let contents = fs.readFileSync(fileName).toString();
		let desc: any = null;
		try {
			desc = JSON.parse(contents);
		} catch (err) {
			return undefined;
		}
		if (!desc || !desc.version) {
			return undefined;
		}
		return desc.version;
	}

	private serviceExited(restart: boolean): void {
		this.servicePromise = null;
		this.tsServerLogFile = null;
		Object.keys(this.callbacks).forEach((key) => {
			this.callbacks[parseInt(key)].e(new Error('Service died.'));
		});
		this.callbacks = Object.create(null);
		if (restart) {
			let diff = Date.now() - this.lastStart;
			this.numberRestarts++;
			let startService = true;
			if (this.numberRestarts > 5) {
				let prompt: Thenable<MyMessageItem | undefined> | undefined = undefined;
				this.numberRestarts = 0;
				if (diff < 10 * 1000 /* 10 seconds */) {
					this.lastStart = Date.now();
					startService = false;
					prompt = window.showErrorMessage<MyMessageItem>(
						localize('serverDiedAfterStart', 'The TypeScript language service died 5 times right after it got started. The service will not be restarted.'),
						{
							title: localize('serverDiedReportIssue', 'Report Issue'),
							id: MessageAction.reportIssue,
							isCloseAffordance: true
						});
					this.logTelemetry('serviceExited');
				} else if (diff < 60 * 1000 /* 1 Minutes */) {
					this.lastStart = Date.now();
					prompt = window.showWarningMessage<MyMessageItem>(
						localize('serverDied', 'The TypeScript language service died unexpectedly 5 times in the last 5 Minutes.'),
						{
							title: localize('serverDiedReportIssue', 'Report Issue'),
							id: MessageAction.reportIssue,
							isCloseAffordance: true
						});
				}
				if (prompt) {
					prompt.then(item => {
						if (item && item.id === MessageAction.reportIssue) {
							return commands.executeCommand('workbench.action.reportIssues');
						}
						return undefined;
					});
				}
			}
			if (startService) {
				this.startService(true);
			}
		}
	}

	public normalizePath(resource: Uri): string | null {
		if (resource.scheme === TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME) {
			return resource.toString();
		}

		if (resource.scheme === 'untitled' && this._apiVersion.has213Features()) {
			return resource.toString();
		}

		if (resource.scheme !== 'file') {
			return null;
		}
		let result = resource.fsPath;
		if (!result) {
			return null;
		}
		// Both \ and / must be escaped in regular expressions
		return result.replace(new RegExp('\\' + this.pathSeparator, 'g'), '/');
	}

	public asUrl(filepath: string): Uri {
		if (filepath.startsWith(TypeScriptServiceClient.WALK_THROUGH_SNIPPET_SCHEME_COLON)
			|| (filepath.startsWith('untitled:') && this._apiVersion.has213Features())
		) {
			return Uri.parse(filepath);
		}
		return Uri.file(filepath);
	}

	public execute(command: string, args: any, expectsResultOrToken?: boolean | CancellationToken): Promise<any> {
		let token: CancellationToken | undefined = undefined;
		let expectsResult = true;
		if (typeof expectsResultOrToken === 'boolean') {
			expectsResult = expectsResultOrToken;
		} else {
			token = expectsResultOrToken;
		}

		const request: Proto.Request = {
			seq: this.sequenceNumber++,
			type: 'request',
			command: command,
			arguments: args
		};
		const requestInfo: RequestItem = {
			request: request,
			promise: null,
			callbacks: null
		};
		let result: Promise<any> = Promise.resolve(null);
		if (expectsResult) {
			result = new Promise<any>((resolve, reject) => {
				requestInfo.callbacks = { c: resolve, e: reject, start: Date.now() };
				if (token) {
					token.onCancellationRequested(() => {
						this.tryCancelRequest(request.seq);
						resolve(undefined);
					});
				}
			});
		}
		requestInfo.promise = result;
		this.requestQueue.push(requestInfo);
		this.sendNextRequests();

		return result;
	}

	private sendNextRequests(): void {
		while (this.pendingResponses === 0 && this.requestQueue.length > 0) {
			const item = this.requestQueue.shift();
			if (item) {
				this.sendRequest(item);
			}
		}
	}

	private sendRequest(requestItem: RequestItem): void {
		let serverRequest = requestItem.request;
		this.traceRequest(serverRequest, !!requestItem.callbacks);
		if (requestItem.callbacks) {
			this.callbacks[serverRequest.seq] = requestItem.callbacks;
			this.pendingResponses++;
		}
		this.service()
			.then((childProcess) => {
				childProcess.stdin.write(JSON.stringify(serverRequest) + '\r\n', 'utf8');
			}).then(undefined, err => {
				let callback = this.callbacks[serverRequest.seq];
				if (callback) {
					callback.e(err);
					delete this.callbacks[serverRequest.seq];
					this.pendingResponses--;
				}
			});
	}

	private tryCancelRequest(seq: number): boolean {
		for (let i = 0; i < this.requestQueue.length; i++) {
			if (this.requestQueue[i].request.seq === seq) {
				this.requestQueue.splice(i, 1);
				if (this.trace !== Trace.Off) {
					this.logTrace(`TypeScript Service: canceled request with sequence number ${seq}`);
				}
				return true;
			}
		}

		if (this.apiVersion.has222Features() && this.cancellationPipeName) {
			if (this.trace !== Trace.Off) {
				this.logTrace(`TypeScript Service: trying to cancel ongoing request with sequence number ${seq}`);
			}
			try {
				fs.writeFileSync(this.cancellationPipeName + seq, '');
				return true;
			} catch (e) {
				// noop
			}
		}

		if (this.trace !== Trace.Off) {
			this.logTrace(`TypeScript Service: tried to cancel request with sequence number ${seq}. But request got already delivered.`);
		}
		return false;
	}

	private dispatchMessage(message: Proto.Message): void {
		try {
			if (message.type === 'response') {
				let response: Proto.Response = <Proto.Response>message;
				let p = this.callbacks[response.request_seq];
				if (p) {
					this.traceResponse(response, p.start);
					delete this.callbacks[response.request_seq];
					this.pendingResponses--;
					if (response.success) {
						p.c(response);
					} else {
						p.e(response);
					}
				}
			} else if (message.type === 'event') {
				let event: Proto.Event = <Proto.Event>message;
				this.traceEvent(event);
				if (event.event === 'syntaxDiag') {
					this.host.syntaxDiagnosticsReceived(event as Proto.DiagnosticEvent);
				} else if (event.event === 'semanticDiag') {
					this.host.semanticDiagnosticsReceived(event as Proto.DiagnosticEvent);
				} else if (event.event === 'configFileDiag') {
					this.host.configFileDiagnosticsReceived(event as Proto.ConfigFileDiagnosticEvent);
				} else if (event.event === 'telemetry') {
					let telemetryData = (event as Proto.TelemetryEvent).body;
					let properties: ObjectMap<string> = Object.create(null);
					switch (telemetryData.telemetryEventName) {
						case 'typingsInstalled':
							let typingsInstalledPayload: Proto.TypingsInstalledTelemetryEventPayload = (telemetryData.payload as Proto.TypingsInstalledTelemetryEventPayload);
							properties['installedPackages'] = typingsInstalledPayload.installedPackages;

							if (is.defined(typingsInstalledPayload.installSuccess)) {
								properties['installSuccess'] = typingsInstalledPayload.installSuccess.toString();
							}
							if (is.string(typingsInstalledPayload.typingsInstallerVersion)) {
								properties['typingsInstallerVersion'] = typingsInstalledPayload.typingsInstallerVersion;
							}
							break;
						default:
							let payload = telemetryData.payload;
							if (payload) {
								Object.keys(payload).forEach((key) => {
									if (payload.hasOwnProperty(key) && is.string(payload[key])) {
										properties[key] = payload[key];
									}
								});
							}
							break;
					}
					this.logTelemetry(telemetryData.telemetryEventName, properties);
				} else if (event.event === 'projectLanguageServiceState') {
					const data = (event as Proto.ProjectLanguageServiceStateEvent).body;
					if (data) {
						this._onProjectLanguageServiceStateChanged.fire(data);
					}
				} else if (event.event === 'beginInstallTypes') {
					const data = (event as Proto.BeginInstallTypesEvent).body;
					if (data) {
						this._onDidBeginInstallTypings.fire(data);
					}
				} else if (event.event === 'endInstallTypes') {
					const data = (event as Proto.EndInstallTypesEvent).body;
					if (data) {
						this._onDidEndInstallTypings.fire(data);
					}
				} else if (event.event === 'typesInstallerInitializationFailed') {
					const data = (event as Proto.TypesInstallerInitializationFailedEvent).body;
					if (data) {
						this._onTypesInstallerInitializationFailed.fire(data);
					}
				}
			} else {
				throw new Error('Unknown message type ' + message.type + ' recevied');
			}
		} finally {
			this.sendNextRequests();
		}
	}

	private traceRequest(request: Proto.Request, responseExpected: boolean): void {
		if (this.trace === Trace.Off) {
			return;
		}
		let data: string | undefined = undefined;
		if (this.trace === Trace.Verbose && request.arguments) {
			data = `Arguments: ${JSON.stringify(request.arguments, null, 4)}`;
		}
		this.logTrace(`Sending request: ${request.command} (${request.seq}). Response expected: ${responseExpected ? 'yes' : 'no'}. Current queue length: ${this.requestQueue.length}`, data);
	}

	private traceResponse(response: Proto.Response, startTime: number): void {
		if (this.trace === Trace.Off) {
			return;
		}
		let data: string | undefined = undefined;
		if (this.trace === Trace.Verbose && response.body) {
			data = `Result: ${JSON.stringify(response.body, null, 4)}`;
		}
		this.logTrace(`Response received: ${response.command} (${response.request_seq}). Request took ${Date.now() - startTime} ms. Success: ${response.success} ${!response.success ? '. Message: ' + response.message : ''}`, data);
	}

	private traceEvent(event: Proto.Event): void {
		if (this.trace === Trace.Off) {
			return;
		}
		let data: string | undefined = undefined;
		if (this.trace === Trace.Verbose && event.body) {
			data = `Data: ${JSON.stringify(event.body, null, 4)}`;
		}
		this.logTrace(`Event received: ${event.event} (${event.seq}).`, data);
	}
}