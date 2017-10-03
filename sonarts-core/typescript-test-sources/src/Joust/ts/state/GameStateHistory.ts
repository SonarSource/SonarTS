import GameState from "./GameState";
import {GameTag, Step} from "../enums";
import * as Immutable from "immutable";
import {HistoryEntry} from "../interfaces";

/**
 * Organizes game states in a linear history.
 */
export default class GameStateHistory {
	public tail: HistoryEntry = null; // earliest
	public head: HistoryEntry = null; // latest
	public pointer: HistoryEntry = null;
	public turnMap: Immutable.Map<number, GameState> = Immutable.OrderedMap<number, GameState>();

	public push(gameState: GameState): void {
		let time = gameState.time;
		if (typeof time !== "number") {
			// we cannot handle timeless game states
			return;
		}

		let game = gameState.game;
		if (game) {
			let turn = game.getTag(GameTag.TURN);
			// no duplicates or turn 0
			if (!this.turnMap.has(turn) && turn > 0) {
				let step = game.getTag(GameTag.STEP);
				// any turn is real once mulligan is done and we have game and players
				let real = !(step === Step.INVALID || step === Step.BEGIN_MULLIGAN) && gameState.getPlayerCount() > 0;
				// only add once MAIN_START occurs, or if we haven't had any turn yet and see a real turn
				if (step === Step.MAIN_START || (this.turnMap.isEmpty() && real)) {
					this.turnMap = this.turnMap.set(turn, gameState);
				}
			}
		}

		if (!this.tail && !this.head) {
			let element = {state: gameState};
			this.tail = element;
			this.head = element;
			this.pointer = element;
			return;
		}

		if (time > this.head.state.time) {
			let element = {state: gameState, prev: this.head};
			this.head.next = element;
			this.head = element;
		}
		else if (time === this.head.state.time) {
			// overwrite state if time is identical
			this.head.state = gameState;
		}
		else {
			console.error("Replay contains out-of-order timestamps");
		}
	}

	public getLatest(time: number): GameState {
		if (!this.pointer) {
			return null;
		}

		while (this.pointer.state.time < time && this.pointer.next) {
			// we want to move towards the head

			if (this.pointer.next.state.time > time) {
				// do not pass the last state before time
				break;
			}

			this.pointer = this.pointer.next;
		}

		while (this.pointer.state.time > time && this.pointer.prev) {
			// we want to move towards the tail
			this.pointer = this.pointer.prev;
		}

		return this.pointer.state;
	}
}
