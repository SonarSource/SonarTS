import {EventEmitter} from "events";
import HearthstoneJSON from "hearthstonejson";
import * as React from "react";
import * as ReactDOM from "react-dom";
import GameWidget from "./components/GameWidget";
import {CardData, GameWidgetProps, JoustEventHandler} from "./interfaces";
import HSReplayDecoder from "./protocol/HSReplayDecoder";
import GameStateScrubber from "./state/GameStateScrubber";
import GameStateSink from "./state/GameStateSink";
import GameStateTracker from "./state/GameStateTracker";
import TexturePreloader from "./TexturePreloader";
import {cookie} from "cookie_js";

export default class Launcher {

	public static destroy(target: any): void {
		ReactDOM.unmountComponentAtNode(target);
	}

	protected target: string | HTMLElement;
	protected opts: GameWidgetProps;
	protected startFromTurn: number;
	protected turnCb: (turn: number) => void;
	protected shouldStartPaused: boolean;
	protected ref: GameWidget;
	protected cards: CardData[];
	protected metadataSourceCb: (build: number|"latest", locale: string) => string;
	protected _build: number|null;
	protected ready: boolean;
	protected hsjson: HearthstoneJSON;
	protected customLocale: boolean;
	protected _onSelectLocale: (locale: string) => void;

	constructor(target: any) {
		this.target = target;
		this.customLocale = !!cookie.get("joust_locale");
		this.opts = {
			debug: false,
			logger: (error: Error): void => {
				let message = error.message ? error.message : error;
				console.error(message);
			},
			locale: cookie.get("joust_locale", "enUS"),
			selectLocale: (locale: string, loaded?: () => void): void => {
				this.customLocale = true;
				this.locale(locale, () => {
					if(this._onSelectLocale) {
						this._onSelectLocale(locale);
					}
					loaded && loaded();
				});
			},
			enableKeybindings: true,
		} as any;
		this.opts.assetDirectory = (asset) => "assets/" + asset;
		this.opts.cardArtDirectory = (cardId) => "https://art.hearthstonejson.com/v1/256x/" + cardId + ".jpg";
		this._build = null;
		this.hsjson = null;
		this.startFromTurn = 0;
		this.ready = false;
	}

	public width(width: number): Launcher {
		this.opts.width = width;
		return this;
	}

	public height(height: number): Launcher {
		this.opts.height = height;
		return this;
	}

	public assets(assets: string|((asset: string) => string)): Launcher {
		let cb = null;
		if (typeof assets === "string") {
			cb = (asset: string) => assets + asset;
		}
		else {
			cb = assets;
		}
		this.opts.assetDirectory = cb;
		return this;
	}

	public cardArt(url: string|((cardId: string) => string)): Launcher {
		let cb = null;
		if (typeof url === "string") {
			cb = (cardId: string) => url + cardId + ".jpg";
		}
		else {
			cb = url;
		}
		this.opts.cardArtDirectory = cb;
		return this;
	}

	public metadataSource(metadataSource: (build: number|"latest", locale: string) => string): Launcher {
		console.warn("Launcher.metadataSource is deprecated");
		return this;
	}

	public setOptions(opts: any): Launcher {
		for (let prop in opts) {
			if (prop) {
				this.opts[prop] = opts[prop];
			}
		}
		return this;
	}

	public onTurn(callback: (turn: number) => void): Launcher {
		this.turnCb = callback;
		return this;
	}

	public onToggleReveal(callback: (reveal: boolean) => void): Launcher {
		this.opts.onToggleReveal = callback;
		return this;
	}

	public onToggleSwap(callback: (swap: boolean) => void): Launcher {
		this.opts.onToggleSwap = callback;
		return this;
	}

	public onFullscreen(callback: (fullscreen: boolean) => void): Launcher {
		this.opts.onFullscreen = callback;
		return this;
	}

	public startPaused(paused?: boolean): Launcher {
		this.shouldStartPaused = typeof paused === "undefined" ? true : !!paused;
		return this;
	}

	public onReady(ready: () => void): Launcher {
		this.opts.onReady = ready;
		return this;
	}

	public startAtTurn(turn: number): Launcher {
		this.startFromTurn = turn;
		return this;
	}

	public startRevealed(reveal: boolean): Launcher {
		this.opts.startRevealed = reveal;
		return this;
	}

	public startSwapped(swap: boolean): Launcher {
		this.opts.startSwapped = swap;
		return this;
	}

	public fullscreen(fullscreen: boolean) {
		if (this.ref) {
			if (fullscreen) {
				this.ref.enterFullscreen();
			}
			else {
				this.ref.exitFullscreen();
			}
		}
		return this;
	}

	public logger(logger: (message: string | Error) => void): Launcher {
		this.opts.logger = logger;
		return this;
	}

	public events(cb: JoustEventHandler): Launcher {
		this.opts.events = cb;
		this.track("init", {count: 1});
		return this;
	}

	public debug(enable?: boolean): Launcher {
		if (typeof enable === "undefined" || enable === null) {
			enable = true;
		}
		this.opts.debug = enable;
		return this;
	}

	public locale(locale: string, cb?: () => void): Launcher {
		this.opts.locale = locale;
		if (this.ready) {
			this.fetchLocale(cb);
			this.render();
		}
		else {
			cb && cb();
		}
		return this;
	}

	public get build(): number|null {
		return this._build;
	}

	public onSelectLocale(callback: (locale: string) => void): void {
		this._onSelectLocale = callback;
	}

	public get selectedLocale(): string|null {
		return this.customLocale ? this.opts.locale : null;
	}

	public get replayDuration(): number {
		return this.opts.scrubber.getDuration();
	}

	public get secondsWatched(): number {
		return (this.opts.scrubber as GameStateScrubber).secondsWatched;
	}

	public get percentageWatched(): number {
		return (this.opts.scrubber as GameStateScrubber).percentageWatched;
	}

	public play(): void {
		this.opts.scrubber.play();
		this.shouldStartPaused = false;
	}

	public pause(): void {
		this.opts.scrubber.pausePlayback();
		this.shouldStartPaused = true;
	}

	public toggle(): void {
		this.opts.scrubber.toggle();
	}

	public rewind(): void {
		this.opts.scrubber.rewind();
	}

	public get turn(): number {
		return this.opts.scrubber.getCurrentTurn();
	}

	public set turn(turn: number) {
		let turnState = this.opts.scrubber.getHistory().turnMap.get(turn);
		if (turnState) {
			this.opts.scrubber.seek(turnState.time);
		}
	}

	public get playing(): boolean {
		return this.opts.scrubber.isPlaying();
	}

	public set playing(playing: boolean) {
		if (playing) {
			this.play();
		}
		else {
			this.pause();
		}
	}

	public enableKeybindings(): Launcher {
		this.opts.enableKeybindings = true;
		this.render();
		return this;
	}

	public disableKeybindings(): Launcher {
		this.opts.enableKeybindings = false;
		this.render();
		return this;
	}

	public addPlayerName(playerName: string): Launcher {
		if (!this.opts.playerNames) {
			this.opts.playerNames = [];
		}
		this.opts.playerNames[this.opts.playerNames.length] = playerName;
		return this;
	}

	public fromUrl(url: string): Launcher {
		let decoder = new HSReplayDecoder();
		decoder.debug = this.opts.debug;
		let tracker = new GameStateTracker();
		let scrubber = new GameStateScrubber(null, this.startFromTurn);
		if (this.turnCb) {
			scrubber.on("turn", this.turnCb);
		}
		let sink = new GameStateSink();
		let preloader = new TexturePreloader(this.opts.cardArtDirectory, this.opts.assetDirectory);
		if (preloader.canPreload()) {
			preloader.consume();
		}

		const result = fetch(url).then((response: Response) => {
			const statusCode = response.status;
			let success = (statusCode === 200);
			this.track("replay_load_error", {error: success ? false : true}, {statusCode: statusCode});
			if (!success) {
				throw new Error("Could not load replay (status code " + statusCode + ")");
			}

			return response.text();
		});

		result.then((payload: string) => {
			let components = [decoder, tracker, scrubber, preloader];
			components.forEach((component: EventEmitter) => {
				component.on("error", this.log.bind(this));
			});

			Promise.all([
				new Promise((cb) => {
					scrubber.once("ready", () => cb());
				}),
				new Promise((cb) => {
					decoder.once("build", (buildNumber?: number) => {
						this._build = buildNumber;
						this.fetchLocale(cb);
					});
				}),
				new Promise((cb) => {
					decoder.once("end", () => cb());
				}),
			]).then(() => {
				scrubber.play();
				if (this.shouldStartPaused) {
					scrubber.pausePlayback();
				}
				if (this.opts.onReady) {
					this.opts.onReady();
				}
				this.track("startup", {count: 1, duration: (Date.now() - this.opts.startupTime) / 1000});
			});

			decoder // xml -> mutators
				.pipe(tracker) // mutators -> latest gamestate
				.pipe(scrubber) // gamestate -> gamestate emit on scrub past
				.pipe(sink); // gamestate

			const streamString = payload.split("");
			for (let part of streamString) {
				if (!decoder.writable) {
					break;
				}
				decoder.write(part);
			}

			decoder.end();

			if (this.opts.cardArtDirectory) {
				decoder.pipe(preloader);
			}
		});

		result.catch(() => {
			this.opts.loadingError = true;
			this.render();
		});

		decoder.on("error", (error) => {
			decoder.end();
			this.opts.loadingError = true;
			this.render();
		});

		decoder.once("error", () => this.track("decoder_error", {count: 1}));

		this.opts.sink = sink;
		this.opts.scrubber = scrubber;
		this.opts.cardOracle = decoder;
		this.opts.mulliganOracle = decoder;

		this.opts.startupTime = +Date.now();
		this.ready = true;
		this.render();

		this.track("starting_from_turn", {fromTurn: this.startFromTurn ? true : false, turn: +this.startFromTurn});

		return this;
	}

	protected log(message: any): void {
		this.opts.logger(message);
	}

	protected track(event: string, values: Object, tags?: Object): void {
		if (!this.opts.events) {
			return;
		}
		if (!tags) {
			tags = {};
		}
		this.opts.events(event, values, tags);
	}

	protected fetchLocale(cb?: () => void): void {
		const build = this._build || "latest";

		if (!this.hsjson) {
			this.hsjson = new HearthstoneJSON();
		}

		let queryTime = Date.now();
		this.hsjson.get(build, this.opts.locale).then((cards: any[]) => {
			// defer setCards if component isn't mounted yet
			if (this.ref) {
				this.ref.setCards(cards);
			}
			else {
				this.cards = cards;
			}
			this.track("metadata", {duration: (Date.now() - queryTime) / 1000}, {
				cards: cards.length,
				build: build,
				has_build: build !== "latest",
				cached: (this.hsjson as any).cached,
				fallback: (this.hsjson as any).fallback,
			});
			cb && cb();
		});
	}

	protected render(): void {
		if (!this.ready) {
			return;
		}
		this.ref = ReactDOM.render(
			React.createElement(GameWidget as any, this.opts),
			typeof this.target === "string" ? document.getElementById(this.target as string) : this.target
		);
		if (this.cards) {
			this.ref.setCards(this.cards);
			this.cards = null;
		}
	}
}
