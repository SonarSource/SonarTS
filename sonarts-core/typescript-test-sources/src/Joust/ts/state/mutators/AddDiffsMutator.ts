import GameState from "../GameState";
import GameStateMutator from "../GameStateMutator";
import * as _ from "lodash";
import {GameStateDiff} from "../../interfaces";

export default class AddDiffsMutator implements GameStateMutator {

	constructor(public diffs: GameStateDiff[]) {
	}

	public applyTo(state: GameState): GameState {
		let diffs = state.diffs;
		_.forEach(this.diffs, (diff: GameStateDiff) => {
			diffs = diffs.add(diff);
		});
		return new GameState(
			state.entities,
			state.entityTree,
			state.options,
			state.optionTree,
			state.time,
			state.choices,
			state.descriptors,
			diffs
		);
	}
}
