import GameState from "./GameState";
import * as Stream from "stream";
import {StreamScrubber, StreamScrubberInhibitor} from "../interfaces";
import GameStateHistory from "./GameStateHistory";
import {GameTag} from "../enums";

/**
 * Interacts with the GameStateHistory by scrubbing over it, emitting whenever the historical GameState changes.
 */
export default class GameStateScrubber extends Stream.Duplex implements StreamScrubber {

	protected history: GameStateHistory;
	protected inhibitor: StreamScrubberInhibitor;
	protected timeSeen: boolean[];

	constructor(history?: GameStateHistory, startFromTurn?: number, opts?: Stream.DuplexOptions) {
		opts = opts || {};
		opts.objectMode = true;
		opts.allowHalfOpen = true;
		super(opts);
		this.interval = null;
		this.initialTime = null;
		this.currentTime = 0;
		this.speed = 1;
		this.multiplier = 1.5;
		this.history = history || new GameStateHistory();
		this.lastState = null;
		this.endTime = null;
		this.hasEmittedReady = false;
		this.hasStarted = false;
		this.startFromTurn = startFromTurn || null;
		this.timeSeen = [];
	}

	protected initialTime: number;
	protected currentTime: number;
	protected endTime: number;
	protected hasEmittedReady: boolean;
	protected hasStarted: boolean;
	protected startFromTurn: number;

	_write(gameState: any, encoding: string, callback: Function): void {
		let time = gameState.time;

		let ready = false;

		if (time !== null) {
			// setup initial time if unknown
			if (this.initialTime === null) {
				this.initialTime = time;
				ready = true;
			}

			// track game state
			this.history.push(gameState);

			if (this.endTime === null || time > this.endTime) {
				this.endTime = time;
			}
		}

		if (!this.hasStarted && this.currentTime === 0 && this.startFromTurn) {
			ready = false;
			if (this.history.turnMap.has(this.startFromTurn)) {
				this.currentTime = this.history.turnMap.get(this.startFromTurn).time;
				ready = true;
			}
		}

		if (ready) {
			this.emit("ready");
			this.hasEmittedReady = true;
			this.update();
		}

		callback();
	}

	_read(): void {
		return;
	}

	end(): void {
		if (!this.hasEmittedReady) {
			// this might happen if a initial turn is requested that we never found
			this.emit("ready");
			this.hasEmittedReady = true;
			this.update();
		}
	}

	protected lastUpdate: number;
	protected interval: number;

	public play(): void {
		this.lastUpdate = new Date().getTime();
		this.interval = setInterval(this.update.bind(this), 100);
		this.hasStarted = true;
		this.emit("play");
		this.lastState = null;
		this.update();
	}

	public pausePlayback(): void {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
		this.emit("pause");
		this.update();
	}

	public toggle(): void {
		if (this.isPlaying()) {
			this.pausePlayback();
		}
		else {
			this.play();
		}
	}

	protected speed: number;
	protected multiplier: number;
	protected lastState: GameState;

	protected update(): void {
		if (this.initialTime === null) {
			return;
		}

		let lastTurn = this.currentTurn;

		this.timeSeen[Math.floor(this.currentTime)] = true;

		if (this.isPlaying() && this.speed != 0) {
			let now = new Date().getTime();
			let elapsed = (now - this.lastUpdate) * this.speed * this.multiplier;
			this.lastUpdate = now;

			if (!this.isInhibited()) {
				this.currentTime += elapsed / 1000;

				if (this.hasEnded()) {
					this.currentTime = this.endTime - this.initialTime;
					this.pausePlayback();
					return;
				}
			}
		}

		let latest = this.history.getLatest(this.currentTime + this.initialTime);
		if (latest !== this.lastState) {
			this.lastState = latest;
			this.push(latest);
		}

		let currentTurn = this.currentTurn;
		if (lastTurn !== currentTurn) {
			this.emit("turn", currentTurn);
		}

		this.emit("update");
	}


	public seek(time: number): void {
		if (time === this.currentTime) {
			return;
		}
		this.currentTime = time;
		this.update();
	}

	public isPlaying(): boolean {
		return this.interval !== null;
	}

	public isPlaybackPaused(): boolean {
		return !this.isPlaying();
	}

	public rewind(): void {
		this.currentTime = 0;
		this.update();
	}

	public fastForward(): void {
		this.currentTime = this.endTime - this.initialTime;
		this.pausePlayback();
	}

	public setSpeed(speed: number): void {
		this.speed = speed;
		this.update();
	}

	public getSpeed(): number {
		return this.speed;
	}

	public canInteract(): boolean {
		return this.hasStarted;
	}

	public canRewind(): boolean {
		return this.currentTime > 0 || this.isPlaying();
	}

	public getCurrentTime(): number {
		return this.currentTime;
	}

	public hasEnded(): boolean {
		return this.currentTime + this.initialTime >= this.endTime;
	}

	public canPlay(): boolean {
		return !this.hasEnded() && this.canInteract();
	}

	public getHistory(): GameStateHistory {
		return this.history;
	}

	public getDuration(): number {
		return Math.max(this.endTime - this.initialTime, 0);
	}

	public setInhibitor(inhibitor: StreamScrubberInhibitor): void {
		this.inhibitor = inhibitor;
	}

	protected isInhibited() {
		return this.inhibitor && this.inhibitor.isInhibiting();
	}

	public getCurrentTurn(): number {
		return this.currentTurn;
	}

	get currentTurn(): number {
		if (!this.lastState) {
			return null;
		}
		let game = this.lastState.game;
		if (!game) {
			return null;
		}
		if (this.history.turnMap.isEmpty()) {
			return 0;
		}
		let turnOne = this.history.turnMap.get(1);
		if (turnOne && this.lastState.time < turnOne.time) {
			return 0;
		}
		return game.getTag(GameTag.TURN) || 0;
	}

	/**
	 * Skips forward to the beginning of the previous turn.
	 */
	public nextTurn(): void {
		let nextTurn = this.endTime - this.initialTime;
		let currentTurn = this.currentTurn;
		if (this.currentTime < this.history.turnMap.first().time) {
			currentTurn--;
		}
		let turn = currentTurn + 1;
		while (!this.history.turnMap.has(turn) && turn < this.history.turnMap.count()) {
			turn++;
		}
		if (this.history.turnMap.has(turn)) {
			nextTurn = this.history.turnMap.get(turn).time;
		}
		this.currentTime = nextTurn;
		this.update();
	}

	/**
	 * Skips back to the beginning of the previous turn.
	 */
	public previousTurn(): void {
		let previousTurn = this.initialTime;
		let turn = this.currentTurn - 1;
		while (!this.history.turnMap.has(turn) && turn > 0) {
			turn--;
		}
		if (this.history.turnMap.has(turn)) {
			previousTurn = this.history.turnMap.get(turn).time;
		}
		this.currentTime = previousTurn;
		this.update();
	}

	/**
	 * Skips back to the beginning of either the current turn or the last turn.
	 * Behaviour depends on the playback progress of the current turn and the playback speed.
	 * Always skips to the previous turn if playback is paused.
	 */
	public skipBack(): void {
		let turnStartState = this.history.turnMap.get(this.currentTurn);
		if (!turnStartState) {
			this.previousTurn();
			return;
		}
		let turnStart = turnStartState.time;
		let timeElapsed = this.currentTime - turnStart;
		if (timeElapsed > (this.isPlaying() ? 1.5 * this.speed * this.multiplier : 0)) {
			this.currentTime = turnStart;
			this.update();
		}
		else {
			this.previousTurn();
		}
	}

	/**
	 * Skips directly to the next action.
	 */
	public nextAction(): void {
		// ensure the history pointer is at the current timestamp
		this.history.getLatest(this.currentTime);

		const next = this.history.pointer.next;

		if (!next) {
			return;
		}

		this.currentTime = next.state.time;
		this.update();
	}

	/**
	 * Skips directly to the action before the currently displayed one.
	 */
	public previousAction(): void {
		this.history.getLatest(this.currentTime);

		const prev = this.history.pointer.prev;

		if (!prev) {
			return;
		}

		this.currentTime = prev.state.time;
		this.update();
	}

	public get secondsWatched(): number {
		let count = -1; // 0 is always set
		for (let i = 0; i < this.timeSeen.length; i++) {
			if (this.timeSeen[i]) {
				count++;
			}
		}
		return count;
	}

	public get percentageWatched(): number {
		let percentage = 100 / Math.floor(this.getDuration()) * this.secondsWatched;
		if (!isFinite(percentage)) {
			percentage = 0;
		}
		return percentage;
	}
}
